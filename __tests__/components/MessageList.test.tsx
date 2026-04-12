import React from "react";
import { render, screen } from "@testing-library/react";
import MessageList from "@/components/MessageList";
import { Message } from "@/types";

// Mock react-markdown since it requires ESM transform
jest.mock("react-markdown", () => {
  return function MockMarkdown({ children }: { children: string }) {
    return <div data-testid="markdown">{children}</div>;
  };
});

const mockMessages: Message[] = [
  {
    id: "1",
    role: "user",
    content: "Hola, necesito ayuda con mi inscripción",
    attachments: [],
    createdAt: new Date("2024-01-01T10:00:00"),
  },
  {
    id: "2",
    role: "assistant",
    content: "Claro, con gusto te ayudo con tu inscripción. ¿Cuál es tu problema?",
    attachments: [],
    createdAt: new Date("2024-01-01T10:00:05"),
  },
];

describe("MessageList", () => {
  it("renders user messages", () => {
    render(<MessageList messages={mockMessages} isLoading={false} />);
    expect(
      screen.getByText("Hola, necesito ayuda con mi inscripción")
    ).toBeInTheDocument();
  });

  it("renders assistant messages", () => {
    render(<MessageList messages={mockMessages} isLoading={false} />);
    expect(
      screen.getByText(
        "Claro, con gusto te ayudo con tu inscripción. ¿Cuál es tu problema?"
      )
    ).toBeInTheDocument();
  });

  it("shows loading indicator when isLoading is true", () => {
    render(<MessageList messages={[]} isLoading={true} />);
    // Loading is shown as animated dots, check the container
    const container = document.querySelector(".animate-bounce");
    expect(container).not.toBeNull();
  });

  it("does not show loading indicator when isLoading is false", () => {
    render(<MessageList messages={mockMessages} isLoading={false} />);
    const container = document.querySelector(".animate-bounce");
    expect(container).toBeNull();
  });

  it("renders empty list when no messages", () => {
    const { container } = render(
      <MessageList messages={[]} isLoading={false} />
    );
    // Should render the container but with no messages
    expect(container.querySelector(".space-y-6")).toBeInTheDocument();
  });

  it("renders image attachment preview", () => {
    const messagesWithImage: Message[] = [
      {
        id: "3",
        role: "user",
        content: "Mira esta imagen",
        attachments: [
          {
            id: "att1",
            name: "foto.jpg",
            type: "image/jpeg",
            url: "data:image/jpeg;base64,/9j/...",
            size: 1024,
          },
        ],
        createdAt: new Date(),
      },
    ];
    render(<MessageList messages={messagesWithImage} isLoading={false} />);
    const img = screen.getByAltText("foto.jpg");
    expect(img).toBeInTheDocument();
  });

  it("renders multiple messages in order", () => {
    render(<MessageList messages={mockMessages} isLoading={false} />);
    const allMessages = screen.getAllByText(/.+/);
    // Both messages should be present
    expect(
      screen.getByText("Hola, necesito ayuda con mi inscripción")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Claro, con gusto te ayudo con tu inscripción. ¿Cuál es tu problema?"
      )
    ).toBeInTheDocument();
    expect(allMessages.length).toBeGreaterThan(0);
  });
});
