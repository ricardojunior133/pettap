import { z } from "zod";

const phonePattern = /^[+()\d][+()\d\s.-]{5,30}$/;

const text = (maximum: number, label: string) => z.string().trim().min(2, `${label} is required.`).max(maximum);

export const emergencyContactIdSchema = z.string().uuid();

export const emergencyContactInputSchema = z.object({
  name: text(120, "Name"),
  relationship: text(80, "Relationship"),
  phone: z.string().trim().max(32).regex(phonePattern, "Enter a valid phone number."),
  isPrimary: z.boolean(),
}).strict();
