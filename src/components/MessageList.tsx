"use client";

import React, { useEffect, useRef } from "react";
import { Message } from "@/types";
import ReactMarkdown from "react-markdown";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

function AssistantAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center flex-shrink-0">
      <span className="text-white text-xs font-bold">UC</span>
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
      <span className="text-white text-xs font-bold">Tú</span>
    </div>
  );
}

function AttachmentPreview({
  attachment,
}: {
  attachment: { id: string; name: string; type: string; url: string; size: number };
}) {
  if (attachment.type.startsWith("image/")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={attachment.url}
        alt={attachment.name}
        className="max-w-xs max-h-48 rounded-lg object-cover"
      />
    );
  }
  if (attachment.type.startsWith("video/")) {
    return (
      <video
        src={attachment.url}
        controls
        className="max-w-xs max-h-48 rounded-lg"
      />
    );
  }
  return (
    <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 text-sm">
      <span>{attachment.type === "application/pdf" ? "📄" : "📎"}</span>
      <span className="text-white">{attachment.name}</span>
    </div>
  );
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6" style={{ scrollbarWidth: "thin", scrollbarColor: "#4B5563 transparent" }}>
      <div className="max-w-3xl mx-auto space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            {msg.role === "assistant" ? <AssistantAvatar /> : <UserAvatar />}
            <div
              className={`flex flex-col gap-2 max-w-[80%] ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {msg.attachments.map((attachment) => (
                    <AttachmentPreview key={attachment.id} attachment={attachment} />
                  ))}
                </div>
              )}
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#2f2f2f] text-white"
                    : "bg-transparent text-gray-100"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-4">
            <AssistantAvatar />
            <div className="flex items-center gap-1 bg-transparent px-4 py-3">
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
