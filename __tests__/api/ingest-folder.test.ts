
jest.mock("@/lib/mongodb", () => jest.fn());
jest.mock("@/lib/gemini", () => ({
  getGeminiClient: jest.fn().mockReturnValue({
    getGenerativeModel: jest.fn().mockReturnValue({
      embedContent: jest.fn().mockResolvedValue({
        embedding: { values: [0.1, 0.2, 0.3] }
      })
    })
  })
}));
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((body, init) => {
      // Retorna un response compatible con la prueba
      return {
        json: async () => body,
        status: init?.status || 200,
        ok: init?.status ? init.status < 400 : true
      };
    })
  }
}));
jest.mock("@/models/Conocimiento", () => ({
  __esModule: true,
  default: { create: jest.fn() },
}));
jest.mock("fs", () => ({
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  unlinkSync: jest.fn(),
  readdirSync: jest.fn().mockReturnValue(["test-fake.pdf", "real.pdf"]),
  readFileSync: jest.fn((filePath: string) => {
    if (filePath.includes("test-fake.pdf")) throw new Error("ENOENT");
    return Buffer.from("PDFDATA");
  }),
}));
jest.mock("pdf-parse/lib/pdf-parse.js", () => async () => ({ text: "contenido de prueba" }));

import { GET } from "@/app/api/ingest-folder/route";
import path from "path";

describe("Ingest Folder API", () => {
  it("debe ignorar archivos PDF faltantes y continuar procesando los demás", async () => {
    // Simula que no existe el archivo test-fake.pdf
    const response = await GET();
    const json = await response.json();
    // El historial debe reportar el archivo faltante pero no lanzar excepción
    expect(json.detalles.some((d: string) => d.includes("Archivo no encontrado") || d.includes("ilegible"))).toBe(true);
    expect(json.success).toBe(true);
  });
});
