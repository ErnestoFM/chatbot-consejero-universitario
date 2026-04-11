import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChatInput from "@/components/ChatInput";

// Mock fetch for file upload
global.fetch = jest.fn();

describe("ChatInput", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the textarea with placeholder text", () => {
    const mockSend = jest.fn();
    render(<ChatInput onSendMessage={mockSend} isLoading={false} />);
    expect(
      screen.getByPlaceholderText("Escribe tu mensaje aquí...")
    ).toBeInTheDocument();
  });

  it("renders the send button", () => {
    const mockSend = jest.fn();
    render(<ChatInput onSendMessage={mockSend} isLoading={false} />);
    expect(screen.getByRole("button", { name: /enviar mensaje/i })).toBeInTheDocument();
  });

  it("renders the file attachment button", () => {
    const mockSend = jest.fn();
    render(<ChatInput onSendMessage={mockSend} isLoading={false} />);
    expect(screen.getByRole("button", { name: /adjuntar archivo/i })).toBeInTheDocument();
  });

  it("disables send button when message is empty", () => {
    const mockSend = jest.fn();
    render(<ChatInput onSendMessage={mockSend} isLoading={false} />);
    const sendButton = screen.getByRole("button", { name: /enviar mensaje/i });
    expect(sendButton).toBeDisabled();
  });

  it("enables send button when message has content", () => {
    const mockSend = jest.fn();
    render(<ChatInput onSendMessage={mockSend} isLoading={false} />);
    const textarea = screen.getByPlaceholderText("Escribe tu mensaje aquí...");
    fireEvent.change(textarea, { target: { value: "Hola" } });
    const sendButton = screen.getByRole("button", { name: /enviar mensaje/i });
    expect(sendButton).not.toBeDisabled();
  });

  it("calls onSendMessage when send button is clicked with a message", () => {
    const mockSend = jest.fn();
    render(<ChatInput onSendMessage={mockSend} isLoading={false} />);
    const textarea = screen.getByPlaceholderText("Escribe tu mensaje aquí...");
    fireEvent.change(textarea, { target: { value: "Hola consejero" } });
    const sendButton = screen.getByRole("button", { name: /enviar mensaje/i });
    fireEvent.click(sendButton);
    expect(mockSend).toHaveBeenCalledWith("Hola consejero", []);
  });

  it("clears the textarea after sending", () => {
    const mockSend = jest.fn();
    render(<ChatInput onSendMessage={mockSend} isLoading={false} />);
    const textarea = screen.getByPlaceholderText("Escribe tu mensaje aquí...");
    fireEvent.change(textarea, { target: { value: "Hola" } });
    const sendButton = screen.getByRole("button", { name: /enviar mensaje/i });
    fireEvent.click(sendButton);
    expect(textarea).toHaveValue("");
  });

  it("sends message on Enter key press", () => {
    const mockSend = jest.fn();
    render(<ChatInput onSendMessage={mockSend} isLoading={false} />);
    const textarea = screen.getByPlaceholderText("Escribe tu mensaje aquí...");
    fireEvent.change(textarea, { target: { value: "Mensaje de prueba" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
    expect(mockSend).toHaveBeenCalledWith("Mensaje de prueba", []);
  });

  it("does not send on Shift+Enter", () => {
    const mockSend = jest.fn();
    render(<ChatInput onSendMessage={mockSend} isLoading={false} />);
    const textarea = screen.getByPlaceholderText("Escribe tu mensaje aquí...");
    fireEvent.change(textarea, { target: { value: "Línea 1" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("disables send button when isLoading is true", () => {
    const mockSend = jest.fn();
    render(<ChatInput onSendMessage={mockSend} isLoading={true} />);
    const sendButton = screen.getByRole("button", { name: /enviar mensaje/i });
    expect(sendButton).toBeDisabled();
  });

  it("disables attachment button when isLoading is true", () => {
    const mockSend = jest.fn();
    render(<ChatInput onSendMessage={mockSend} isLoading={true} />);
    const attachButton = screen.getByRole("button", { name: /adjuntar archivo/i });
    expect(attachButton).toBeDisabled();
  });

  it("shows disclaimer text", () => {
    const mockSend = jest.fn();
    render(<ChatInput onSendMessage={mockSend} isLoading={false} />);
    expect(
      screen.getByText(/El consejero puede cometer errores/i)
    ).toBeInTheDocument();
  });
});
