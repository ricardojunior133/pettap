import { z } from "zod";

/** A tag can only be linked after its existing account ownership is verified server-side. */
export const customerPetTagLinkSchema = z.object({
  publicCode: z.string().trim().regex(/^[A-Za-z0-9_-]{3,128}$/),
}).strict();

export const customerPetTagPublicIdentifierSchema = z.string().trim().regex(/^pet_[a-f0-9]{32}$/);

export type CustomerPetTagLinkInput = z.infer<typeof customerPetTagLinkSchema>;
