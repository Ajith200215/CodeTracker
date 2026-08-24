import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || "super-secret-key-12345",
  });

  const pathname = req.nextUrl.pathname;

  // Protect /teacher/** routes: require TEACHER or ADMIN role
  if (pathname.startsWith("/teacher")) {
    if (!token) {
      // Redirect unauthenticated users to home page login modal instead of harsh 403
      return NextResponse.redirect(new URL("/?login=true", req.url));
    }
    const role = token.role as string;
    if (role !== "TEACHER" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  // Protect /student/** routes: require STUDENT or ADMIN role
  if (pathname.startsWith("/student")) {
    if (!token) {
      return NextResponse.redirect(new URL("/?login=true", req.url));
    }
    const role = token.role as string;
    if (role !== "STUDENT" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/teacher/:path*", "/student/:path*"],
};
