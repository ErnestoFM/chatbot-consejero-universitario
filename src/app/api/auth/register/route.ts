import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import UserModel from "@/models/User";
import {
  getAuthCookieName,
  signAuthToken,
  validateEmail,
  validatePassword,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      password,
      confirmPassword,
    }: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = body;

    const safeName = name?.trim() || "";
    const safeEmail = email?.trim().toLowerCase() || "";

    if (!safeName) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }

    if (!safeEmail || !validateEmail(safeEmail)) {
      return NextResponse.json({ error: "Correo electrónico inválido" }, { status: 400 });
    }

    if (!password || !validatePassword(password)) {
      return NextResponse.json(
        {
          error:
            "La contraseña debe tener mínimo 8 caracteres, una mayúscula y un número",
        },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "La confirmación de contraseña no coincide" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingUser = await UserModel.findOne({ email: safeEmail });
    if (existingUser) {
      return NextResponse.json({ error: "Correo ya registrado" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      name: safeName,
      email: safeEmail,
      password: hashedPassword,
    });

    const token = signAuthToken({
      userId: String(user._id),
      email: user.email,
    });

    const response = NextResponse.json(
      {
        message: "Registro exitoso",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );

    response.cookies.set(getAuthCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}