import { z } from "zod";
export const tagIdSchema = z.string().uuid();
export const activationInputSchema = z.object({ code: z.string().trim().min(6).max(64).regex(/^[A-Za-z0-9-]+$/, "Enter a valid tag code."), petId: z.string().uuid() }).strict();
export const normalizeTagCode = (code: string) => code.trim().toUpperCase();
