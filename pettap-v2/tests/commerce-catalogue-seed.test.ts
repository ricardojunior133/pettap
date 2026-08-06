import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const seed = readFileSync(resolve(process.cwd(), "scripts/seed-commerce.mjs"), "utf8");

describe("development commercial catalogue seed", () => {
  it("requires an explicit development-only opt-in", () => {
    expect(seed).toContain('PETTAP_COMMERCE_SEED !== "1"');
    expect(seed).toContain('PETTAP_COMMERCE_SEED_ENV !== "development"');
  });

  it("provisions only six size-by-finish variants with canonical GBP prices", () => {
    for (const sku of ["PTP-PET-MAT", "PTP-CLA-MAT", "PTP-EXP-MAT", "PTP-PET-GLS", "PTP-CLA-GLS", "PTP-EXP-GLS"]) expect(seed).toContain(sku);
    for (const price of ["1999", "2499", "2999"]) expect(seed).toContain(price);
    expect(seed).toContain("on conflict (sku) do update");
  });
});
