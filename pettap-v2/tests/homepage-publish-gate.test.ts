import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const homepageSource = readFileSync(resolve(root, "app/page.tsx"), "utf8");
const layoutSource = readFileSync(resolve(root, "app/layout.tsx"), "utf8");
const proxySource = readFileSync(resolve(root, "proxy.ts"), "utf8");

describe("premium homepage publication gate", () => {
  it("renders the premium homepage at the root without Coming Soon metadata", () => {
    expect(homepageSource).toContain('import HomePage from "@/components/landing/HomePage"');
    expect(homepageSource).toContain("return <HomePage />");
    expect(homepageSource).not.toContain("PremiumComingSoon");
    expect(homepageSource).not.toContain("Coming Soon");
    expect(layoutSource).not.toContain("Coming Soon");
  });

  it("keeps only approved public routes available during the production launch gate", () => {
    expect(proxySource).toContain('process.env.PETTAP_COMING_SOON_MODE !== "false"');
    expect(proxySource).toContain('"/",');
    expect(proxySource).toContain('"/robots.txt",');
    expect(proxySource).toContain('"/sitemap.xml",');
    expect(proxySource).toContain('"/opengraph-image",');
    expect(proxySource).not.toContain('"/studio",');
    expect(proxySource).not.toContain('"/checkout",');
    expect(proxySource).not.toContain('"/contact",');
    expect(proxySource).not.toContain('"/privacy",');
    expect(proxySource).not.toContain('"/terms",');
  });

  it("keeps Event Demo public and account and admin routes protected before the launch gate", () => {
    expect(proxySource).toContain('pathname === "/event" || pathname.startsWith("/event/")');
    expect(proxySource).toContain('pathname === "/admin" || pathname.startsWith("/admin/")');
    expect(proxySource).toContain('pathname === "/account" || pathname.startsWith("/account/")');
    expect(proxySource).toContain('return NextResponse.redirect(new URL("/login", request.url))');
    expect(proxySource).toContain('if (!isComingSoonLaunch || publicPaths.has(pathname)) return NextResponse.next()');
    expect(proxySource).toContain('return NextResponse.redirect(new URL("/", request.url))');
  });
});
