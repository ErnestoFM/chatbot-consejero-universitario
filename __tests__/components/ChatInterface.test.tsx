import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChatInterface from "@/components/ChatInterface";

jest.mock("@/components/Sidebar", () => ({
  __esModule: true,
  default: () => <div />,
}));

jest.mock("@/components/MessageList", () => ({
  __esModule: true,
  default: () => <div />,
}));

jest.mock("@/components/ChatInput", () => ({
  __esModule: true,
  default: ({ onSendMessage }: { onSendMessage: (message: string, attachments: never[]) => void }) => (
    <button onClick={() => onSendMessage("Hola", [])}>Enviar</button>
  ),
}));

jest.mock("@/components/StarterBoxes", () => ({
  __esModule: true,
  default: () => <div />,
}));

describe("ChatInterface", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("calls onUnauthorized when send message returns 401", async () => {
    const onUnauthorized = jest.fn();
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ chats: [] }) });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: "No autorizado" }),
    });

    render(<ChatInterface onUnauthorized={onUnauthorized} onLogout={jest.fn()} />);

    fireEvent.click(await screen.findByRole("button", { name: "Enviar" }));

    await waitFor(() => {
      expect(onUnauthorized).toHaveBeenCalledWith("Sesión expirada, inicia sesión de nuevo");
    });
  });
});