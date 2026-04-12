import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import ChatModel from "@/models/Chat";
import ModeloConocimiento from "@/models/Conocimiento";
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

    let textosContexto = "";
    try {
      const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
      const embedRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "models/gemini-embedding-001",
            content: { parts: [{ text: message }] },
          }),
        }
      );

      if (!embedRes.ok) {
        throw new Error(`Embedding error: ${embedRes.status} ${await embedRes.text()}`);
      }

      const embedData = await embedRes.json();
      const preguntaVector: number[] = embedData.embedding.values;

      // 2. Buscar en MongoDB el texto más relevante
      const contextoRelevante = await ModeloConocimiento.aggregate([
        {
          $vectorSearch: {
            index: "vector_index",
            path: "embedding",
            queryVector: preguntaVector,
            numCandidates: 100,
            limit: 3,
          },
        },
      ]);

      textosContexto = contextoRelevante.map((doc) => doc.texto).join("\n\n");
    } catch (e) {
      console.warn("Fallo en RAG (embedding o vector search):", e);
      // El chat sigue funcionando sin contexto RAG
    }

    let aiResponse: string;

    if (attachments && attachments.length > 0) {
      const fileContents = attachments
        .filter((a: { base64Data?: string; type: string }) => a.base64Data)
        .map((a: { base64Data: string; type: string }) => ({
          mimeType: a.type,
          data: a.base64Data,
        }));

      if (fileContents.length > 0) {
        aiResponse = await generateResponseWithFiles(message, fileContents, history, textosContexto);
      } else {
        aiResponse = await generateChatResponse(message, history, textosContexto);
      }
    } else {
      aiResponse = await generateChatResponse(message, history, textosContexto);
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
      { error: error instanceof Error ? error.message : "Error interno del servidor" },
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
