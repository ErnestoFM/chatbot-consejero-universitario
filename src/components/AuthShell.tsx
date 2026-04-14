"use client";

import React, { useCallback, useEffect, useState } from "react";
import ChatInterface from "@/components/ChatInterface";
import AuthPanel from "@/components/AuthPanel";

export default function AuthShell() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const handleSessionExpired = useCallback((message: string) => {
    setNoticeMessage(message);
    setIsAuthenticated(false);
  }, []);

  const checkSession = useCallback(async (notifyOnFailure: boolean) => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        setIsAuthenticated(true);
        setNoticeMessage(null);
        return;
      }

      if (notifyOnFailure) {
        handleSessionExpired("Sesión expirada, inicia sesión de nuevo");
        return;
      }

      setIsAuthenticated(false);
    } catch {
      setIsAuthenticated(false);
    }
  }, [handleSessionExpired]);

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore logout transport errors and clear local state anyway.
    } finally {
      setNoticeMessage(null);
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    checkSession(false);

    const intervalId = window.setInterval(() => {
      checkSession(true);
    }, 300000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [checkSession]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#111827] text-white flex items-center justify-center">
        Cargando...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthPanel
        onAuthenticated={() => {
          setNoticeMessage(null);
          setIsAuthenticated(true);
        }}
        noticeMessage={noticeMessage}
      />
    );
  }

  return (
    <ChatInterface
      onUnauthorized={handleSessionExpired}
      onLogout={handleLogout}
    />
  );
}