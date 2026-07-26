import { NextResponse, type NextRequest } from "next/server";

import { updateSupabaseSession } from "@/lib/backend/supabase/proxy";

const isComingSoonLaunch = process.env.NODE_ENV === "production" && process.env.PETTAP_COMING_SOON_MODE !== "false";

const publicPaths = new Set([
  "/",
  "/contact",
  "/privacy",
  "/terms",
  "/robots.txt",
  "/sitemap.xml",
  "/opengraph-image",
]);
const authPaths = new Set(["/login", "/register", "/auth/callback"]);

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname === "/event" || pathname.startsWith("/event/")) {
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const { response, user } = await updateSupabaseSession(request);
    if (!user) return NextResponse.redirect(new URL("/login", request.url));
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  if (authPaths.has(pathname)) {
    const { response } = await updateSupabaseSession(request);
    return response;
  }

  if (!isComingSoonLaunch || publicPaths.has(pathname)) return NextResponse.next();
  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"],
};
