import { NextResponse, type NextRequest } from "next/server";

import { isComingSoonLaunch } from "@/lib/launch/config";

const publicPaths = new Set([
  "/",
  "/contact",
  "/privacy",
  "/terms",
  "/robots.txt",
  "/sitemap.xml",
  "/opengraph-image",
]);

export function proxy(request: NextRequest) {
  if (!isComingSoonLaunch || publicPaths.has(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"],
};
