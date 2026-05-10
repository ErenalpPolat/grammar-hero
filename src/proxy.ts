import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const PUBLIC_PATHS = new Set<string>(["/", "/features", "/pricing", "/about", "/tokens"]);
const AUTH_PATHS = new Set<string>(["/login"]);

export const proxy = auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  const isLoggedIn = !!req.auth?.user?.id;

  if (pathname.startsWith("/api/auth")) return;
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) return;

  if (PUBLIC_PATHS.has(pathname)) return;

  if (AUTH_PATHS.has(pathname)) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/learn", nextUrl));
    }
    return;
  }

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    if (pathname !== "/") loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
