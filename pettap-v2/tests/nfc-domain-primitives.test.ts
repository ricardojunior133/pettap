import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  isNfcTagStatus,
  isPubliclyResolvableTagStatus,
  nfcTagStatuses,
} from "@/features/nfc/domain/tag-status";

describe("NFC domain primitives", () => {
  it("matches exactly the persisted tag_status enum", () => {
    expect(nfcTagStatuses).toEqual([
      "unassigned",
      "active",
      "suspended",
      "lost",
      "retired",
    ]);
    expect(isNfcTagStatus("active")).toBe(true);
    expect(isNfcTagStatus("unknown")).toBe(false);
  });

  it("makes only active and lost tags eligible for a future public resolver", () => {
    expect(isPubliclyResolvableTagStatus("active")).toBe(true);
    expect(isPubliclyResolvableTagStatus("lost")).toBe(true);
    expect(isPubliclyResolvableTagStatus("unassigned")).toBe(false);
    expect(isPubliclyResolvableTagStatus("suspended")).toBe(false);
    expect(isPubliclyResolvableTagStatus("retired")).toBe(false);
  });

  it("keeps the imported rate-limit helper isolated from routes and sensitive values", () => {
    const helper = readFileSync(
      resolve(process.cwd(), "features/nfc/services/public-tag-rate-limit.ts"),
      "utf8",
    );
    expect(helper).toContain("checkRateLimit");
    expect(helper).not.toMatch(/token|hash|activation|accountId|petId/i);
    expect(helper).not.toContain("app/pet");
  });
});
