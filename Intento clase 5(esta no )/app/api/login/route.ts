import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

const SECRET_KEY = process.env.JWT_SECRET || "mi_clave_secreta_super_secreta";

export async function POST(request: Request) {
    const body = await request.json();

    const user = await db.findUserByEmail(body.email);
    if (!user) {
        return NextResponse.json({ error: "Credenciales denegadas" }, { status: 401 });
    }

    const passwordValida = await bcrypt.compare(body.password, user.passwordHash);
    if (!passwordValida) {
        return NextResponse.json({ error: "Credenciales denegadas" }, { status: 401 });
    }

    const token = jwt.sign(
        { id: user.id, name: user.name, role: "user" },
        SECRET_KEY,
        { expiresIn: "2h" }
    );

    const response = NextResponse.json({ success: true }, { status: 200 });

    response.cookies.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 7200
    });

    return response;
}
