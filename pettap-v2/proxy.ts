import { NextResponse, type NextRequest } from "next/server";

import { updateSupabaseSession } from "@/lib/backend/supabase/proxy";

type LaunchEnvironment = Partial<Pick<NodeJS.ProcessEnv, "NODE_ENV" | "PETTAP_COMING_SOON_MODE" | "VERCEL_ENV">>;

export function isComingSoonLaunch(environment: LaunchEnvironment = process.env) {
  return environment.NODE_ENV === "production" && environment.PETTAP_COMING_SOON_MODE !== "false";
}

/** Studio is intentionally previewable on Vercel without widening the production allowlist. */
export function isStudioPreviewRoute(pathname: string, environment: LaunchEnvironment = process.env) {
  return environment.VERCEL_ENV === "preview" && (pathname === "/studio" || pathname.startsWith("/studio/"));
}

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

  if (pathname === "/api/stripe/webhook") return NextResponse.next();

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

  if (!isComingSoonLaunch() || publicPaths.has(pathname) || isStudioPreviewRoute(pathname)) return NextResponse.next();
  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"],
};
