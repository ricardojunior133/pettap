"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getServerEnv } from "@/lib/backend/env";
import { createSupabaseServerClient } from "@/lib/backend/supabase/server";
import { ensureAccountProfile } from "@/features/owner/services/profile-service";
import { clientRequestKey, checkRateLimit } from "@/lib/security/rate-limit";
import { isSameOriginRequest } from "@/lib/security/same-origin";

import { loginSchema, registrationSchema } from "../schemas/auth";

export type AuthActionState = {
  status: "error" | "success";
  message: string;
  fieldErrors?: Record<string, string[]>;
} | null;

function validationState(error: { flatten: () => { fieldErrors: Record<string, string[]> } }): AuthActionState {
  return {
    status: "error",
    message: "Please review the highlighted fields.",
    fieldErrors: error.flatten().fieldErrors,
  };
}

async function getEmailRedirectUrl() {
  const configuredUrl = getServerEnv().NEXT_PUBLIC_SITE_URL;
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");

  if (process.env.NODE_ENV === "development" && origin) {
    try {
      return new URL("/auth/callback", origin).toString();
    } catch {
      // Fall through to the configured canonical URL.
    }
  }

  return new URL("/auth/callback", configuredUrl).toString();
}

function userProfileInput(user: {
  id: string;
  email?: string;
  user_metadata: Record<string, unknown>;
}) {
  return {
    authUserId: user.id,
    email: user.email,
    userMetadata: user.user_metadata,
  };
}

async function canSubmitAuthForm(kind: "login" | "register") {
  const requestHeaders = await headers();
  const rate = checkRateLimit(clientRequestKey(requestHeaders, `auth:${kind}`), kind === "login"
    ? { limit: 10, windowMs: 15 * 60_000 }
    : { limit: 5, windowMs: 60 * 60_000 });
  return rate.allowed && isSameOriginRequest();
}

export async function registerAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!await canSubmitAuthForm("register")) {
    return { status: "error", message: "Please wait a moment before trying again." };
  }
  const parsed = registrationSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    password: formData.get("password"),
    passwordConfirmation: formData.get("passwordConfirmation"),
  });

  if (!parsed.success) return validationState(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.displayName },
      emailRedirectTo: await getEmailRedirectUrl(),
    },
  });

  if (error || !data.user) {
    return {
      status: "error",
      message: "We couldn’t create your account. Please try again or use a different email address.",
    };
  }

  if (!data.session) {
    return {
      status: "success",
      message: "Check your inbox to confirm your email, then return here to continue.",
    };
  }

  await ensureAccountProfile({
    ...userProfileInput(data.user),
    displayName: parsed.data.displayName,
  });
  redirect("/dashboard");
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!await canSubmitAuthForm("login")) {
    return { status: "error", message: "Please wait a moment before trying again." };
  }
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) return validationState(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    return {
      status: "error",
      message: "We couldn’t sign you in with those details. Please try again.",
    };
  }

  await ensureAccountProfile(userProfileInput(data.user));
  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
