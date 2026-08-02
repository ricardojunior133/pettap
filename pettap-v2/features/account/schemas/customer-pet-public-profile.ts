import { z } from "zod";

export const customerPetPublicProfileSchema = z.object({
  enabled: z.boolean(),
  showPhoto: z.boolean(),
  showName: z.boolean(),
  /** Existing canonical flag controls the paired species/breed presentation. */
  showBreed: z.boolean(),
  showAge: z.boolean(),
  publicMessage: z.string().trim().max(280).nullable(),
}).strict().superRefine((value, context) => {
  if (value.publicMessage && /<[^>]*>/.test(value.publicMessage)) {
    context.addIssue({ code: "custom", path: ["publicMessage"], message: "Public message cannot contain HTML." });
  }
});

export type CustomerPetPublicProfileInput = z.infer<typeof customerPetPublicProfileSchema>;
