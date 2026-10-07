import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET || "mi_clave_secreta_super_secreta";

// Interceptamos absolutamente toda la app (excepto imágenes y estáticos)
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Verificamos si el usuario tiene un token válido
  let signedIn = false;
  if (token) {
    try {
      const secret = new TextEncoder().encode(SECRET_KEY);
      await jwtVerify(token, secret);
      signedIn = true;
    } catch (error) {
      signedIn = false;
    }
  }

  if (pathname.startsWith("/api/")) {
    // Si está intentando loguearse o registrarse
    if (pathname === "/api/login" || pathname === "/api/registro") return NextResponse.next();


    if (!signedIn) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    return NextResponse.next();
  }


  // Si no está logueado y quiere entrar a ver las notas, lo mando  al /login
  if (!signedIn && pathname !== "/login") {
    const response = NextResponse.redirect(new URL('/login', request.url));
    if (token) response.cookies.delete('auth_token');
    return response;
  }

  // Si ya está logueado y por accidente quiere ir a /login, lo mandamos al inicio
  if (signedIn && pathname === "/login") {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Para todo lo demás, dejamos pasar
  return NextResponse.next();
}
// esto es lo qe hace el del profe 