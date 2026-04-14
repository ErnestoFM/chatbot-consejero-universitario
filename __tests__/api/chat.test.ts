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
    findOne: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findOneAndDelete: jest.fn(),
  },
}));

jest.mock("@/lib/auth", () => ({
  getAuthUserIdFromRequest: jest.fn().mockReturnValue("user-1"),
}));

jest.mock("@/models/Conocimiento", () => ({
  __esModule: true,
  default: {
    aggregate: jest.fn().mockResolvedValue([{ texto: "texto de prueba" }]),
  },
}));

import { NextRequest } from "next/server";
import { POST, GET, DELETE } from "@/app/api/chat/route";
import ChatModel from "@/models/Chat";
import { getAuthUserIdFromRequest } from "@/lib/auth";

const mockChatModel = ChatModel as jest.Mocked<typeof ChatModel>;
const mockGetAuthUserIdFromRequest = getAuthUserIdFromRequest as jest.Mock;

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
    mockGetAuthUserIdFromRequest.mockReturnValue("user-1");
  });

  it("returns 401 when user is not authenticated", async () => {
    mockGetAuthUserIdFromRequest.mockReturnValue(null);
    const request = createRequest("POST", { message: "Hola" });
    const response = await POST(request);
    expect(response.status).toBe(401);
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
    (mockChatModel.findOne as jest.Mock).mockResolvedValue(null);

    const request = createRequest("POST", {
      message: "¿Qué trámites académicos puedo realizar?",
    });
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockChatModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-1" })
    );
  });
});

describe("Chat API - GET", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAuthUserIdFromRequest.mockReturnValue("user-1");
  });

  it("returns 401 when user is not authenticated", async () => {
    mockGetAuthUserIdFromRequest.mockReturnValue(null);
    const request = createRequest("GET");
    const response = await GET(request);
    expect(response.status).toBe(401);
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
    expect(mockChatModel.find).toHaveBeenCalledWith({ userId: "user-1" });
    const data = await response.json();
    expect(data.chats).toBeDefined();
  });

  it("returns 404 when chat is not found", async () => {
    (mockChatModel.findOne as jest.Mock).mockResolvedValue(null);

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
    (mockChatModel.findOne as jest.Mock).mockResolvedValue(mockChat);

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
    mockGetAuthUserIdFromRequest.mockReturnValue("user-1");
  });

  it("returns 401 when user is not authenticated", async () => {
    mockGetAuthUserIdFromRequest.mockReturnValue(null);
    const request = createRequest("DELETE", undefined, { chatId: "chat1" });
    const response = await DELETE(request);
    expect(response.status).toBe(401);
  });

  it("returns 400 when chatId is not provided", async () => {
    const request = createRequest("DELETE");
    const response = await DELETE(request);

    expect(response.status).toBe(400);
  });

  it("deletes a chat successfully", async () => {
    (mockChatModel.findOneAndDelete as jest.Mock).mockResolvedValue({});

    const request = createRequest("DELETE", undefined, { chatId: "chat1" });
    const response = await DELETE(request);

    expect(response.status).toBe(200);
    expect(mockChatModel.findOneAndDelete).toHaveBeenCalledWith({
      _id: "chat1",
      userId: "user-1",
    });
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  it("returns 404 when deleting a chat that does not belong to the user", async () => {
    (mockChatModel.findOneAndDelete as jest.Mock).mockResolvedValue(null);

    const request = createRequest("DELETE", undefined, { chatId: "chat-ajeno" });
    const response = await DELETE(request);

    expect(response.status).toBe(404);
  });
});
