import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // ✅ Allow NextAuth API routes completely
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // ✅ Allow public APIs
  if (pathname.startsWith("/api/public")) {
    return NextResponse.next();
  }

  const token = await getToken({ req });

  const protectedRoutes = ["/admin", "/manager", "/employee", "/profile"];

  if (
    protectedRoutes.some((route) => pathname.startsWith(route)) &&
    !token
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname === "/login" && token) {
    const roleRedirectMap: Record<string, string> = {
      ADMIN: "/admin",
      MANAGER: "/manager",
      EMPLOYEE: "/employee",
    };

    return NextResponse.redirect(
      new URL(roleRedirectMap[token.role as string] ?? "/", req.url)
    );
  }

  if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/access-denied", req.url));
  }

  if (pathname.startsWith("/manager") && token?.role !== "MANAGER") {
    return NextResponse.redirect(new URL("/access-denied", req.url));
  }

  if (pathname.startsWith("/employee") && token?.role !== "EMPLOYEE") {
    return NextResponse.redirect(new URL("/access-denied", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/admin/:path*",
    "/manager/:path*",
    "/employee/:path*",
    "/profile",
  ],
};
