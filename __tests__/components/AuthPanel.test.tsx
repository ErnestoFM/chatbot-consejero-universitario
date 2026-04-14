import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AuthPanel from "@/components/AuthPanel";

describe("AuthPanel", () => {
  const onAuthenticated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    window.alert = jest.fn();
  });

  it("shows validation error when password confirmation does not match", async () => {
    render(<AuthPanel onAuthenticated={onAuthenticated} />);

    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Usuario Test" },
    });
    fireEvent.change(screen.getByLabelText("Correo"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "Password1" },
    });
    fireEvent.change(screen.getByLabelText("Confirmación de contraseña"), {
      target: { value: "Password2" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Registrarme" }));

    expect(
      await screen.findByText("La confirmación de contraseña no coincide")
    ).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('shows "Registro Exitoso" popup after successful registration', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ message: "Registro exitoso" }),
    });

    render(<AuthPanel onAuthenticated={onAuthenticated} />);

    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Usuario Test" },
    });
    fireEvent.change(screen.getByLabelText("Correo"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "Password1" },
    });
    fireEvent.change(screen.getByLabelText("Confirmación de contraseña"), {
      target: { value: "Password1" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Registrarme" }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Registro Exitoso");
    });
    expect(onAuthenticated).toHaveBeenCalledTimes(1);
  });

  it("logs in successfully in login mode", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ message: "Inicio de sesión exitoso" }),
    });

    render(<AuthPanel onAuthenticated={onAuthenticated} />);

    fireEvent.click(screen.getByRole("button", { name: "Login" }));
    fireEvent.change(screen.getByLabelText("Correo"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "Password1" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/auth/login", expect.any(Object));
    });
    expect(onAuthenticated).toHaveBeenCalledTimes(1);
  });
});