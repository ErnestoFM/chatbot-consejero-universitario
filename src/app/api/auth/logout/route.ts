import { NextRequest, NextResponse } from "next/server";
import { getAuthCookieName } from "@/lib/auth";

export async function POST(_request: NextRequest) {
  const response = NextResponse.json({ message: "Sesión cerrada" });
  response.cookies.set(getAuthCookieName(), "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}