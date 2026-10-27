import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

const SECRET_KEY = process.env.JWT_SECRET || "mi_clave_secreta_super_secreta";

export async function POST(request: Request) {
    const body = await request.json();

    const existeUser = await db.findUserByEmail(body.email);
    if (existeUser) {
        return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(body.password, 10);

    const newUser = await db.createUser({
        id: crypto.randomUUID(),
        name: body.name,
        email: body.email,
        passwordHash: passwordHash
    });

    const token = jwt.sign(
        { id: newUser.id, name: newUser.name, role: "user" },
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
