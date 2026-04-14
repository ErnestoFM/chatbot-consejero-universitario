import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

const AUTH_COOKIE_NAME = "auth_token";
const JWT_EXPIRATION = "7d";

export interface AuthPayload {
  userId: string;
  email: string;
}

export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function validatePassword(password: string): boolean {
  return PASSWORD_REGEX.test(password);
}

export function getJwtSecret(): string {
  return process.env.JWT_SECRET || "dev-jwt-secret-change-me";
}

export function signAuthToken(payload: AuthPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: JWT_EXPIRATION,
  });
}

export function verifyAuthToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as AuthPayload;
  } catch {
    return null;
  }
}

export function getAuthUserIdFromRequest(request: NextRequest): string | null {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  const payload = verifyAuthToken(token);
  return payload?.userId || null;
}

export function getAuthCookieName(): string {
  return AUTH_COOKIE_NAME;
}