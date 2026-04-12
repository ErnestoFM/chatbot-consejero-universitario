import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Sidebar from "@/components/Sidebar";

const mockChats = [
  {
    _id: "chat1",
    title: "Consulta sobre inscripción",
    createdAt: "2024-01-01T10:00:00",
    updatedAt: "2024-01-01T10:05:00",
  },
  {
    _id: "chat2",
    title: "Queja sobre calificación",
    createdAt: "2024-01-02T09:00:00",
    updatedAt: "2024-01-02T09:10:00",
  },
];

describe("Sidebar", () => {
  it("renders the new chat button", () => {
    render(
      <Sidebar
        chats={[]}
        currentChatId={null}
        onSelectChat={jest.fn()}
        onNewChat={jest.fn()}
        onDeleteChat={jest.fn()}
        isOpen={true}
        onClose={jest.fn()}
      />
    );
    expect(screen.getByText("Nueva conversación")).toBeInTheDocument();
  });

  it("renders chat history", () => {
    render(
      <Sidebar
        chats={mockChats}
        currentChatId={null}
        onSelectChat={jest.fn()}
        onNewChat={jest.fn()}
        onDeleteChat={jest.fn()}
        isOpen={true}
        onClose={jest.fn()}
      />
    );
    expect(screen.getByText("Consulta sobre inscripción")).toBeInTheDocument();
    expect(screen.getByText("Queja sobre calificación")).toBeInTheDocument();
  });

  it("calls onNewChat when new chat button is clicked", () => {
    const mockNewChat = jest.fn();
    render(
      <Sidebar
        chats={[]}
        currentChatId={null}
        onSelectChat={jest.fn()}
        onNewChat={mockNewChat}
        onDeleteChat={jest.fn()}
        isOpen={true}
        onClose={jest.fn()}
      />
    );
    fireEvent.click(screen.getByText("Nueva conversación"));
    expect(mockNewChat).toHaveBeenCalledTimes(1);
  });

  it("calls onSelectChat when a chat is clicked", () => {
    const mockSelectChat = jest.fn();
    render(
      <Sidebar
        chats={mockChats}
        currentChatId={null}
        onSelectChat={mockSelectChat}
        onNewChat={jest.fn()}
        onDeleteChat={jest.fn()}
        isOpen={true}
        onClose={jest.fn()}
      />
    );
    fireEvent.click(screen.getByText("Consulta sobre inscripción"));
    expect(mockSelectChat).toHaveBeenCalledWith("chat1");
  });

  it("shows empty state when no chats", () => {
    render(
      <Sidebar
        chats={[]}
        currentChatId={null}
        onSelectChat={jest.fn()}
        onNewChat={jest.fn()}
        onDeleteChat={jest.fn()}
        isOpen={true}
        onClose={jest.fn()}
      />
    );
    expect(
      screen.getByText("No hay conversaciones anteriores")
    ).toBeInTheDocument();
  });

  it("highlights the current chat", () => {
    render(
      <Sidebar
        chats={mockChats}
        currentChatId="chat1"
        onSelectChat={jest.fn()}
        onNewChat={jest.fn()}
        onDeleteChat={jest.fn()}
        isOpen={true}
        onClose={jest.fn()}
      />
    );
    const activeItem = screen.getByText("Consulta sobre inscripción").closest("div");
    expect(activeItem?.className).toContain("bg-white/10");
  });

  it("renders footer with Consejero Universitario branding", () => {
    render(
      <Sidebar
        chats={[]}
        currentChatId={null}
        onSelectChat={jest.fn()}
        onNewChat={jest.fn()}
        onDeleteChat={jest.fn()}
        isOpen={true}
        onClose={jest.fn()}
      />
    );
    expect(screen.getByText("Consejero")).toBeInTheDocument();
    expect(screen.getByText("Universitario")).toBeInTheDocument();
  });
});
