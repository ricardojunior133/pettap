import { describe, expect, it } from "vitest";

import { addressInputSchema } from "@/features/commerce/schemas/address";
import { orderItemPersonalisationSchema } from "@/features/commerce/schemas/personalisation";

describe("commerce schemas", () => {
  it("normalizes UK postcodes at the server boundary", () => {
    const result = addressInputSchema.parse({
      type: "shipping",
      fullName: "Alex Pet Owner",
      addressLine1: "1 Pet Street",
      city: "London",
      postcode: "sw1a1aa",
      countryCode: "gb",
    });
    expect(result.postcode).toBe("SW1A 1AA");
    expect(result.countryCode).toBe("GB");
  });

  it("rejects unknown personalisation keys", () => {
    expect(orderItemPersonalisationSchema.safeParse({ petName: "Charlie", secret: "no" }).success).toBe(false);
  });
});
