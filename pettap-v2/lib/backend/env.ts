import "server-only";

import { z } from "zod";

const emailAddressSchema = z.email();

const senderSchema = z.string().trim().refine((value) => {
  const bracketedAddress = /^.+\s<([^<>]+)>$/.exec(value)?.[1];
  return emailAddressSchema.safeParse(bracketedAddress ?? value).success;
}, "Expected an email address or a display name with an email address.");

export const serverEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  DATABASE_URL: z.url(),
  NEXT_PUBLIC_SITE_URL: z.url(),
  NEXT_PUBLIC_CONTACT_EMAIL: emailAddressSchema,
  RESEND_API_KEY: z.string().trim().min(1).optional(),
  EMAIL_FROM: senderSchema.optional(),
  EMAIL_REPLY_TO: emailAddressSchema.optional(),
});
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export function getServerEnv(): ServerEnv {
  return serverEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_REPLY_TO: process.env.EMAIL_REPLY_TO,
  });
}
