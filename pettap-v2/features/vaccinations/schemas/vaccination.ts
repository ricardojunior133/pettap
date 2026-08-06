import { z } from "zod";

const date = z.string().date("Enter a valid date.");

export const vaccinationInputSchema = z.object({
  name: z.string().trim().min(2, "Vaccination name must be at least 2 characters.").max(120, "Vaccination name must be 120 characters or fewer."),
  administeredAt: date,
  expiresAt: z.preprocess((value) => typeof value === "string" && value.trim() === "" ? null : value, date.nullable()),
}).strict().refine((input) => !input.expiresAt || input.expiresAt >= input.administeredAt, {
  message: "Expiry date must be after the administered date.",
  path: ["expiresAt"],
});

export const vaccinationIdSchema = z.uuid("Invalid vaccination identifier.");
