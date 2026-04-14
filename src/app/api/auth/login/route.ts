import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import UserModel from "@/models/User";
import {
  getAuthCookieName,
  signAuthToken,
  validateEmail,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password }: { email?: string; password?: string } = body;

    const safeEmail = email?.trim().toLowerCase() || "";
    if (!safeEmail || !validateEmail(safeEmail) || !password) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    await connectToDatabase();

    const user = await UserModel.findOne({ email: safeEmail });
    if (!user) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const token = signAuthToken({
      userId: String(user._id),
      email: user.email,
    });

    const response = NextResponse.json({
      message: "Inicio de sesión exitoso",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });

    response.cookies.set(getAuthCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}