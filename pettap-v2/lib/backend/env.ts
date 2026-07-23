import { z } from "zod";

const serverSchema = z.object({ NEXT_PUBLIC_SUPABASE_URL: z.url(), NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1), SUPABASE_SERVICE_ROLE_KEY: z.string().min(1), DATABASE_URL: z.url(), NEXT_PUBLIC_SITE_URL: z.url(), NEXT_PUBLIC_CONTACT_EMAIL: z.email() });
export type ServerEnv = z.infer<typeof serverSchema>;
export function getServerEnv(): ServerEnv { return serverSchema.parse({ NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL: process.env.DATABASE_URL, NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL }); }
