import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const PUBLIC_ROUTES = ["/login", "/register"];
const AUTH_ROUTES = ["/feed"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("bs_token")?.value;
  const session = token ? await verifyToken(token) : null;

  // Redirect authenticated users away from login/register
  if (PUBLIC_ROUTES.includes(pathname) && session) {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  // Redirect unauthenticated users away from protected routes
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route)) && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/feed/:path*", "/login", "/register"],
};
