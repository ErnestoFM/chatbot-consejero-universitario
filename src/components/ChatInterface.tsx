"use client";

import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "./Sidebar";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import StarterBoxes from "./StarterBoxes";
import { Message, Attachment } from "@/types";

interface ChatSession {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface FullChat {
  _id: string;
  title: string;
  messages: Message[];
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChats = useCallback(async () => {
    try {
      const response = await fetch("/api/chat");
      if (response.ok) {
        const data = await response.json();
        setChats(data.chats || []);
      }
    } catch (err) {
      console.error("Error fetching chats:", err);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const handleSelectChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chat?chatId=${chatId}`);
      if (response.ok) {
        const data: { chat: FullChat } = await response.json();
        setCurrentChatId(data.chat._id);
        setMessages(data.chat.messages);
        setSidebarOpen(false);
        setError(null);
      }
    } catch (err) {
      console.error("Error loading chat:", err);
    }
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setError(null);
    setSidebarOpen(false);
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      await fetch(`/api/chat?chatId=${chatId}`, { method: "DELETE" });
      if (currentChatId === chatId) {
        handleNewChat();
      }
      await fetchChats();
    } catch (err) {
      console.error("Error deleting chat:", err);
    }
  };

  const handleSendMessage = async (
    messageText: string,
    attachments: Attachment[]
  ) => {
    if (!messageText.trim() && attachments.length === 0) return;

    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: messageText,
      attachments,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          chatId: currentChatId,
          attachments,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Error al enviar el mensaje");
      }

      const data = await response.json();

      if (!currentChatId) {
        setCurrentChatId(data.chatId);
        await fetchChats();
      }

      setMessages((prev) => [
        ...prev.slice(0, -1), // remove temp user message
        {
          ...userMessage,
          id: data.chat.messages[data.chat.messages.length - 2]?.id || userMessage.id,
        },
        data.message,
      ]);
    } catch (err) {
      console.error("Send message error:", err);
      setError(
        err instanceof Error ? err.message : "Error al enviar el mensaje"
      );
      setMessages((prev) => prev.slice(0, -1)); // remove temp message on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTopic = (prompt: string) => {
    handleSendMessage(prompt, []);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-screen bg-[#212121] overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-gray-400 hover:text-white transition-colors"
            aria-label="Abrir menú"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-base">
              Consejero Universitario
            </span>
          </div>
        </header>

        {/* Chat area */}
        {hasMessages ? (
          <MessageList messages={messages} isLoading={isLoading} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-8 px-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">UC</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                ¿En qué puedo ayudarte hoy?
              </h1>
              <p className="text-gray-400 text-sm max-w-md">
                Soy tu consejero universitario virtual. Puedo ayudarte con
                trámites académicos, orientación vocacional, quejas y bienestar
                estudiantil.
              </p>
            </div>
            <StarterBoxes onSelectTopic={handleSelectTopic} />
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mx-4 mb-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Input */}
        <div className="pb-4 pt-2">
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            disabled={false}
          />
        </div>
      </main>
    </div>
  );
}
