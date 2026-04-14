import { GoogleGenerativeAI, GenerativeModel, Part } from "@google/generative-ai";
import { CONSEJERO_SYSTEM_PROMPT } from "./prompt";

let genAI: GoogleGenerativeAI | null = null;

export function getGeminiClient(): GoogleGenerativeAI {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!genAI) {
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  }
  return genAI;
}

export function getModel(): GenerativeModel {
  const client = getGeminiClient();
  const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  return client.getGenerativeModel({
    model: modelName,
  });
}

export function isQuotaExceededError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.message.includes("429") ||
    error.message.includes("Too Many Requests") ||
    error.message.includes("Quota exceeded") ||
    error.message.includes("quota")
  );
}

let documentContext = "";

export function setDocumentContext(context: string): void {
  documentContext = context;
}

export function getDocumentContext(): string {
  return documentContext;
}

export interface ChatMessage {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

export async function generateChatResponse(
  userMessage: string,
  history: ChatMessage[] = [],
  contextText: string = ""
): Promise<string> {
  const systemInstruction = contextText
    ? `${CONSEJERO_SYSTEM_PROMPT}\n\n[CONTEXTO OFICIAL DEL MANUAL]\n${contextText}`
    : CONSEJERO_SYSTEM_PROMPT;

  const fullHistory: ChatMessage[] = [
    { role: "user", parts: [{ text: systemInstruction }] },
    ...history,
  ];

  const geminiModel = getModel();

  const chat = geminiModel.startChat({
    history: fullHistory,
    generationConfig: {
      maxOutputTokens: 2048,
      temperature: 0.7,
    },
  });

  const result = await chat.sendMessage(userMessage);
  const response = await result.response;
  return response.text();
}

export async function generateResponseWithFiles(
  userMessage: string,
  fileContents: Array<{ mimeType: string; data: string }>,
  history: ChatMessage[] = [],
  contextText: string = ""
): Promise<string> {
  const systemInstruction = contextText
    ? `${CONSEJERO_SYSTEM_PROMPT}\n\n[CONTEXTO OFICIAL DEL MANUAL]\n${contextText}`
    : CONSEJERO_SYSTEM_PROMPT;

  const fullHistory: ChatMessage[] = [
    { role: "user", parts: [{ text: systemInstruction }] },
    ...history,
  ];

  const geminiModel = getModel();

  const parts: Part[] = [
    { text: userMessage },
    ...fileContents.map((file) => ({
      inlineData: { mimeType: file.mimeType, data: file.data },
    })),
  ];

  const chat = geminiModel.startChat({
    history: fullHistory,
    generationConfig: {
      maxOutputTokens: 2048,
      temperature: 0.7,
    },
  });

  const result = await chat.sendMessage(parts);
  const response = await result.response;
  return response.text();
}