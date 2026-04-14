import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import UserModel from "@/models/User";
import { getAuthUserIdFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const userId = getAuthUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    await connectToDatabase();
    const user = await UserModel.findById(userId).select("_id name email");

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Me API error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}