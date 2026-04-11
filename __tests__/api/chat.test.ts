/**
 * @jest-environment node
 *
 * Tests for the Chat API route.
 * These tests use mocking to avoid real database and Gemini connections.
 */

// Mock uuid to avoid ESM issues in node test environment
jest.mock("uuid", () => ({
  v4: () => "test-uuid-1234",
}));

// Mock the modules before importing the route
jest.mock("@/lib/mongodb", () => jest.fn().mockResolvedValue({}));
jest.mock("@/lib/gemini", () => ({
  generateChatResponse: jest
    .fn()
    .mockResolvedValue("Respuesta del consejero universitario"),
  generateResponseWithFiles: jest
    .fn()
    .mockResolvedValue("Respuesta con archivos"),
}));
jest.mock("@/models/Chat", () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

import { NextRequest } from "next/server";
import { POST, GET, DELETE } from "@/app/api/chat/route";
import ChatModel from "@/models/Chat";

const mockChatModel = ChatModel as jest.Mocked<typeof ChatModel>;

function createRequest(
  method: string,
  body?: object,
  searchParams?: Record<string, string>
): NextRequest {
  const url = new URL(
    `http://localhost:3000/api/chat${
      searchParams
        ? "?" + new URLSearchParams(searchParams).toString()
        : ""
    }`
  );
  return new NextRequest(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe("Chat API - POST", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 when message is missing", async () => {
    const request = createRequest("POST", {});
    const response = await POST(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  it("returns 400 when message is empty string", async () => {
    const request = createRequest("POST", { message: "" });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("creates a new chat when no chatId is provided", async () => {
    const mockChat = {
      _id: "new-chat-id",
      title: "¿Qué trámites académicos...",
      messages: [
        {
          id: "msg1",
          role: "user",
          content: "¿Qué trámites académicos puedo realizar?",
          attachments: [],
          createdAt: new Date(),
        },
        {
          id: "msg2",
          role: "assistant",
          content: "Respuesta del consejero universitario",
          attachments: [],
          createdAt: new Date(),
        },
      ],
      save: jest.fn().mockResolvedValue(undefined),
      push: jest.fn(),
    };

    // Mock messages array with push behavior
    mockChat.messages = [] as typeof mockChat.messages;
    const originalPush = Array.prototype.push;
    mockChat.messages.push = function (...args) {
      return originalPush.apply(this, args);
    };

    (mockChatModel.create as jest.Mock).mockResolvedValue(mockChat);
    (mockChatModel.findById as jest.Mock).mockResolvedValue(null);

    const request = createRequest("POST", {
      message: "¿Qué trámites académicos puedo realizar?",
    });
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockChatModel.create).toHaveBeenCalled();
  });
});

describe("Chat API - GET", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns a list of chats when no chatId is provided", async () => {
    const mockChats = [
      { _id: "chat1", title: "Primera conversación", createdAt: new Date(), updatedAt: new Date() },
    ];

    const mockFind = {
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(mockChats),
    };
    (mockChatModel.find as jest.Mock).mockReturnValue(mockFind);

    const request = createRequest("GET");
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.chats).toBeDefined();
  });

  it("returns 404 when chat is not found", async () => {
    (mockChatModel.findById as jest.Mock).mockResolvedValue(null);

    const request = createRequest("GET", undefined, { chatId: "nonexistent-id" });
    const response = await GET(request);

    expect(response.status).toBe(404);
  });

  it("returns the chat when chatId is valid", async () => {
    const mockChat = {
      _id: "chat1",
      title: "Test chat",
      messages: [],
    };
    (mockChatModel.findById as jest.Mock).mockResolvedValue(mockChat);

    const request = createRequest("GET", undefined, { chatId: "chat1" });
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.chat).toBeDefined();
    expect(data.chat._id).toBe("chat1");
  });
});

describe("Chat API - DELETE", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 when chatId is not provided", async () => {
    const request = createRequest("DELETE");
    const response = await DELETE(request);

    expect(response.status).toBe(400);
  });

  it("deletes a chat successfully", async () => {
    (mockChatModel.findByIdAndDelete as jest.Mock).mockResolvedValue({});

    const request = createRequest("DELETE", undefined, { chatId: "chat1" });
    const response = await DELETE(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});
