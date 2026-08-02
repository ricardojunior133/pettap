import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const homepageSource = readFileSync(resolve(root, "app/page.tsx"), "utf8");
const layoutSource = readFileSync(resolve(root, "app/layout.tsx"), "utf8");
const proxySource = readFileSync(resolve(root, "proxy.ts"), "utf8");

describe("Coming Soon publication gate", () => {
  it("renders the approved Coming Soon homepage at the root", () => {
    expect(homepageSource).toContain('import { PremiumComingSoon } from "@/components/coming-soon/PremiumComingSoon"');
    expect(homepageSource).toContain("return <PremiumComingSoon />");
    expect(homepageSource).not.toContain('components/landing/HomePage');
    expect(homepageSource).toContain("PetTap | Coming Soon");
    expect(layoutSource).toContain("PetTap | Coming Soon");
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

  it("allows only the canonical public NFC resolver while keeping internal NFC routes gated", () => {
    expect(proxySource).toContain('pathname.startsWith("/nfc/v1/t/")');
    expect(proxySource).not.toContain('pathname.startsWith("/nfc/")');
    expect(proxySource).toContain("isCanonicalPublicNfcRoute");
  });

  it("keeps Event Demo public and account and admin routes protected before the launch gate", () => {
    expect(proxySource).toContain('pathname === "/event" || pathname.startsWith("/event/")');
    expect(proxySource).toContain('pathname === "/admin" || pathname.startsWith("/admin/")');
    expect(proxySource).toContain('pathname === "/account" || pathname.startsWith("/account/")');
    expect(proxySource).toContain('return NextResponse.redirect(new URL("/login", request.url))');
    expect(proxySource).toContain("if (!isComingSoonLaunch || publicPaths.has(pathname) || isCanonicalPublicNfcRoute)");
    expect(proxySource).toContain('return NextResponse.redirect(new URL("/", request.url))');
  });
});
