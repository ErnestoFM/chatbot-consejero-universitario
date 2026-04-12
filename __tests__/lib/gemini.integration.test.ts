require('dotenv').config({ path: '.env.test' });
import { getModel } from "@/lib/gemini";

describe("Gemini Model Integration", () => {
  it("debe generar una respuesta válida usando el modelo gemini-pro y la API v1", async () => {
    const model = getModel();
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: "Test system instruction" }] },
      ],
    });
    const result = await chat.sendMessage("Hola, ¿puedes responder?");
    const response = await result.response;
    const text = response.text();
    expect(typeof text).toBe("string");
    expect(text.length).toBeGreaterThan(0);
  });
});
