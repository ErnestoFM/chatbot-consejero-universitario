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
  return client.getGenerativeModel({
    model: "gemini-2.0-flash",
  });
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