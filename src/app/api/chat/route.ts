import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import ChatModel from "@/models/Chat";
import { generateChatResponse, generateResponseWithFiles, ChatMessage } from "@/lib/gemini";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, chatId, attachments = [] } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "El mensaje es requerido" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    let chat;
    if (chatId) {
      chat = await ChatModel.findById(chatId);
    }

    if (!chat) {
      const title =
        [...message].length > 50
          ? [...message].slice(0, 50).join("") + "..."
          : message;
      chat = await ChatModel.create({
        title,
        messages: [],
      });
    }

    const userMessage = {
      id: uuidv4(),
      role: "user" as const,
      content: message,
      attachments: attachments || [],
      createdAt: new Date(),
    };

    chat.messages.push(userMessage);

    // Build history for Gemini (excluding the last user message which we just added)
    const history: ChatMessage[] = chat.messages
      .slice(0, -1)
      .map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

    let aiResponse: string;

    if (attachments && attachments.length > 0) {
      const fileContents = attachments
        .filter((a: { base64Data?: string; type: string }) => a.base64Data)
        .map((a: { base64Data: string; type: string }) => ({
          mimeType: a.type,
          data: a.base64Data,
        }));

      if (fileContents.length > 0) {
        aiResponse = await generateResponseWithFiles(message, fileContents, history);
      } else {
        aiResponse = await generateChatResponse(message, history);
      }
    } else {
      aiResponse = await generateChatResponse(message, history);
    }

    const assistantMessage = {
      id: uuidv4(),
      role: "assistant" as const,
      content: aiResponse,
      attachments: [],
      createdAt: new Date(),
    };

    chat.messages.push(assistantMessage);
    await chat.save();

    return NextResponse.json({
      chatId: chat._id,
      message: assistantMessage,
      chat: {
        _id: chat._id,
        title: chat.title,
        messages: chat.messages,
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get("chatId");

    await connectToDatabase();

    if (chatId) {
      const chat = await ChatModel.findById(chatId);
      if (!chat) {
        return NextResponse.json(
          { error: "Conversación no encontrada" },
          { status: 404 }
        );
      }
      return NextResponse.json({ chat });
    }

    const chats = await ChatModel.find({})
      .select("_id title createdAt updatedAt")
      .sort({ updatedAt: -1 })
      .limit(50);

    return NextResponse.json({ chats });
  } catch (error) {
    console.error("Chat GET error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get("chatId");

    if (!chatId) {
      return NextResponse.json(
        { error: "chatId es requerido" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    await ChatModel.findByIdAndDelete(chatId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Chat DELETE error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
