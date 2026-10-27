import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "mi_clave_secreta_super_secreta";

export async function GET(request: NextRequest) {
  //esto es para buscar la cookie
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { name: string; role: string; email?: string };


    return NextResponse.json({
      name: decoded.name,
      role: decoded.role
    });
  } catch (error) {
    return NextResponse.json({ message: "Token inválido o expirado" }, { status: 401 });
  }
}
