import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { presentPublicLostPage } from "@/features/nfc/public-lost-page-presenter";

describe("public Lost page presenter", () => {
  it("renders only permitted public fields and the safety language", () => {
    const view = presentPublicLostPage({ name: "Charlie", species: "Dog", photoUrl: "https://signed.example/image", reportedAt: "2026-07-31" });
    expect(view.headline).toBe("This pet has been reported missing");
    expect(view.safetyMessage).toBe("If you have found this pet, please keep them safe.");
    expect(view).toMatchObject({ name: "Charlie", species: "Dog", photoUrl: "https://signed.example/image", reportedAt: "2026-07-31" });
  });
  it("keeps private Lost profiles generic and omits absent optional fields", () => {
    const view = presentPublicLostPage({});
    expect(view.name).toBeUndefined(); expect(view.species).toBeUndefined(); expect(view.photoUrl).toBeUndefined(); expect(view.reportedAt).toBeUndefined();
    expect(JSON.stringify(view)).not.toMatch(/details|actor|reportId|petId|tagId|email|phone|address|credential|storage/i);
  });
  it("keeps the canonical route dynamic, private to search engines and without the legacy branch", () => {
    const source = readFileSync("app/nfc/v1/t/[publicCode]/page.tsx", "utf8");
    expect(source).toContain('dynamic="force-dynamic"'); expect(source).toContain("revalidate=0");
    expect(source).toContain("robots:{index:false,follow:false}"); expect(source).not.toContain("lost_pending_reconciliation");
    expect(source).toContain("presentPublicLostPage");
  });
  it("uses generic output for unavailable tags without rendering private report data", () => {
    const source = readFileSync("app/nfc/v1/t/[publicCode]/page.tsx", "utf8");
    expect(source).toContain("This PetTap is unavailable.");
    expect(source).not.toContain("details"); expect(source).not.toContain("actorAccountId"); expect(source).not.toContain("storagePath");
  });
});
