import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

function getGeminiClient(): GoogleGenerativeAI {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!genAI) {
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  }
  return genAI;
}

function getModel(): GenerativeModel {
  if (!model) {
    const client = getGeminiClient();
    model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
  }
  return model;
}

/**
 * System prompt for the university counselor chatbot.
 * This can be extended with context from PDF documents (RAG).
 */
const SYSTEM_PROMPT = `Eres un consejero universitario inteligente y empático. 
Tu objetivo es ayudar a los estudiantes universitarios con:
- Orientación académica y planificación de carrera
- Resolución de problemas y quejas académicas
- Información sobre trámites y procedimientos universitarios
- Apoyo emocional y bienestar estudiantil
- Información sobre recursos y servicios universitarios

Responde siempre de manera profesional, amable y comprensiva. 
Usa un lenguaje claro y accesible para los estudiantes.
Si no tienes información específica sobre algo, indícalo honestamente y sugiere dónde pueden encontrar ayuda.`;

/**
 * Context from PDF documents (placeholder for RAG implementation).
 * When PDFs are provided, their content will be added here.
 */
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
  history: ChatMessage[] = []
): Promise<string> {
  const geminiModel = getModel();

  const systemWithContext = documentContext
    ? `${SYSTEM_PROMPT}\n\nContexto adicional de documentos:\n${documentContext}`
    : SYSTEM_PROMPT;

  const chat = geminiModel.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: systemWithContext }],
      },
      {
        role: "model",
        parts: [
          {
            text: "Entendido. Estoy listo para ayudarte como consejero universitario.",
          },
        ],
      },
      ...history,
    ],
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
  history: ChatMessage[] = []
): Promise<string> {
  const geminiModel = getModel();

  const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [
    { text: userMessage },
    ...fileContents.map((file) => ({
      inlineData: { mimeType: file.mimeType, data: file.data },
    })),
  ];

  const systemWithContext = documentContext
    ? `${SYSTEM_PROMPT}\n\nContexto adicional de documentos:\n${documentContext}`
    : SYSTEM_PROMPT;

  const chat = geminiModel.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: systemWithContext }],
      },
      {
        role: "model",
        parts: [
          {
            text: "Entendido. Estoy listo para ayudarte como consejero universitario.",
          },
        ],
      },
      ...history,
    ],
    generationConfig: {
      maxOutputTokens: 2048,
      temperature: 0.7,
    },
  });

  const result = await chat.sendMessage(parts as Parameters<typeof chat.sendMessage>[0]);
  const response = await result.response;
  return response.text();
}
