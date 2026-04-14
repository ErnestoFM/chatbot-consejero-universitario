import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import AuthShell from "@/components/AuthShell";

jest.mock("@/components/ChatInterface", () => ({
  __esModule: true,
  default: () => <div>ChatInterfaceMock</div>,
}));

jest.mock("@/components/AuthPanel", () => ({
  __esModule: true,
  default: ({ noticeMessage }: { noticeMessage?: string }) => (
    <div>
      <div>AuthPanelMock</div>
      {noticeMessage ? <div>{noticeMessage}</div> : null}
    </div>
  ),
}));

describe("AuthShell", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("shows auth panel when session is invalid", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

    render(<AuthShell />);

    expect(await screen.findByText("AuthPanelMock")).toBeInTheDocument();
  });

  it("revalidates session periodically and shows expiration message", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: false });

    render(<AuthShell />);

    expect(await screen.findByText("ChatInterfaceMock")).toBeInTheDocument();

    jest.advanceTimersByTime(300000);

    await waitFor(() => {
      expect(screen.getByText("AuthPanelMock")).toBeInTheDocument();
      expect(
        screen.getByText("Sesión expirada, inicia sesión de nuevo")
      ).toBeInTheDocument();
    });
  });
});