"use client";

import React, { FormEvent, useMemo, useState } from "react";

interface AuthPanelProps {
  onAuthenticated: () => void;
  noticeMessage?: string | null;
}

type AuthMode = "register" | "login";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function AuthPanel({ onAuthenticated, noticeMessage }: AuthPanelProps) {
  const [mode, setMode] = useState<AuthMode>("register");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const title = useMemo(
    () => (mode === "register" ? "Crear cuenta" : "Iniciar sesión"),
    [mode]
  );

  const validateRegister = (): string | null => {
    if (!name.trim()) return "El nombre es requerido";
    if (!emailRegex.test(email.trim())) return "Correo electrónico inválido";
    if (!passwordRegex.test(password)) {
      return "La contraseña debe tener mínimo 8 caracteres, una mayúscula y un número";
    }
    if (password !== confirmPassword) {
      return "La confirmación de contraseña no coincide";
    }
    return null;
  };

  const validateLogin = (): string | null => {
    if (!emailRegex.test(email.trim())) return "Correo electrónico inválido";
    if (!password) return "La contraseña es requerida";
    return null;
  };

  const resetSensitiveFields = () => {
    setPassword("");
    setConfirmPassword("");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const validationError =
      mode === "register" ? validateRegister() : validateLogin();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint =
        mode === "register" ? "/api/auth/register" : "/api/auth/login";
      const payload =
        mode === "register"
          ? {
              name: name.trim(),
              email: email.trim(),
              password,
              confirmPassword,
            }
          : {
              email: email.trim(),
              password,
            };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "No fue posible autenticarte");
      }

      if (mode === "register") {
        window.alert("Registro Exitoso");
      }

      onAuthenticated();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No fue posible autenticarte"
      );
      resetSensitiveFields();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111827] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#1f2937] border border-white/10 rounded-2xl p-6 shadow-2xl">
        <h1 className="text-2xl font-bold mb-1">{title}</h1>
        <p className="text-sm text-gray-300 mb-6">
          Accede para ver solo tus conversaciones.
        </p>

        {noticeMessage && (
          <div className="mb-4 rounded-lg border border-amber-400/40 bg-amber-500/15 px-3 py-2 text-sm text-amber-200">
            {noticeMessage}
          </div>
        )}

        <div className="flex gap-2 mb-6 bg-black/20 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            className={`flex-1 rounded-md py-2 text-sm transition-colors ${
              mode === "register"
                ? "bg-teal-500 text-white"
                : "text-gray-300 hover:text-white"
            }`}
          >
            Registro
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`flex-1 rounded-md py-2 text-sm transition-colors ${
              mode === "login"
                ? "bg-teal-500 text-white"
                : "text-gray-300 hover:text-white"
            }`}
          >
            Login
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label htmlFor="name" className="block text-sm mb-1 text-gray-200">
                Nombre
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 outline-none focus:border-teal-400"
                autoComplete="name"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm mb-1 text-gray-200">
              Correo
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 outline-none focus:border-teal-400"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm mb-1 text-gray-200">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 outline-none focus:border-teal-400"
              autoComplete={mode === "register" ? "new-password" : "current-password"}
            />
          </div>

          {mode === "register" && (
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm mb-1 text-gray-200"
              >
                Confirmación de contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 outline-none focus:border-teal-400"
                autoComplete="new-password"
              />
            </div>
          )}

          {error && (
            <div className="text-sm text-red-300 bg-red-500/20 border border-red-500/40 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-teal-500 hover:bg-teal-400 disabled:opacity-70 disabled:cursor-not-allowed py-2.5 font-medium"
          >
            {isSubmitting
              ? "Procesando..."
              : mode === "register"
              ? "Registrarme"
              : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}