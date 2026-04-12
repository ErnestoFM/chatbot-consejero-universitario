/**
 * Tests for the Gemini service utilities.
 */

// Set the API key before importing the module
process.env.GEMINI_API_KEY = "test-api-key";

// Mock the GoogleGenerativeAI module
jest.mock("@google/generative-ai", () => {
  const mockSendMessage = jest.fn().mockResolvedValue({
    response: { text: () => "Respuesta de prueba del consejero" },
  });
  const mockStartChat = jest.fn().mockReturnValue({
    sendMessage: mockSendMessage,
  });
  const mockGetGenerativeModel = jest.fn().mockReturnValue({
    startChat: mockStartChat,
  });
  const MockGoogleGenerativeAI = jest.fn().mockImplementation(() => ({
    getGenerativeModel: mockGetGenerativeModel,
  }));
  return { GoogleGenerativeAI: MockGoogleGenerativeAI };
});

import {
  generateChatResponse,
  setDocumentContext,
  getDocumentContext,
  ChatMessage,
} from "@/lib/gemini";

describe("Gemini Service", () => {
  beforeEach(() => {
    setDocumentContext("");
  });

  describe("generateChatResponse", () => {
    it("returns a response string", async () => {
      const response = await generateChatResponse("Hola, necesito ayuda");
      expect(typeof response).toBe("string");
      expect(response.length).toBeGreaterThan(0);
    });

    it("accepts history parameter", async () => {
      const history: ChatMessage[] = [
        { role: "user", parts: [{ text: "Hola" }] },
        { role: "model", parts: [{ text: "Hola, ¿en qué te puedo ayudar?" }] },
      ];
      const response = await generateChatResponse("Necesito info sobre trámites", history);
      expect(typeof response).toBe("string");
    });

    it("works with empty history", async () => {
      const response = await generateChatResponse("Primera pregunta", []);
      expect(typeof response).toBe("string");
    });
  });

  describe("setDocumentContext and getDocumentContext", () => {
    it("sets and gets document context", () => {
      setDocumentContext("Contexto de prueba del PDF");
      expect(getDocumentContext()).toBe("Contexto de prueba del PDF");
    });

    it("clears document context when empty string is set", () => {
      setDocumentContext("Some context");
      setDocumentContext("");
      expect(getDocumentContext()).toBe("");
    });

    it("initial document context is empty", () => {
      // Since we reset in beforeEach
      expect(getDocumentContext()).toBe("");
    });
  });
});
