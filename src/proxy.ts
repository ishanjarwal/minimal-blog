import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Add security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }

  // Enforce noindex headers on admin and internal API mutation routes (allow public /api/og)
  const isPrivateApi = pathname.startsWith("/api/") && !pathname.startsWith("/api/og");
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/write") ||
    isPrivateApi ||
    pathname.includes("/edit")
  ) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }

  // Guard protected admin routes: /write and /blog/:slug/edit
  const isProtectedAdminRoute =
    pathname.startsWith("/write") || pathname.includes("/edit");

  if (isProtectedAdminRoute) {
    const adminSession = request.cookies.get("blog_admin_session")?.value;
    if (!adminSession) {
      const loginUrl = new URL("/admin", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
