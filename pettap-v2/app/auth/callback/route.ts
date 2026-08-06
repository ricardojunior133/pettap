import { NextResponse, type NextRequest } from "next/server";

import { ensureAccountProfile } from "@/features/owner/services/profile-service";
import { createSupabaseServerClient } from "@/lib/backend/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const loginUrl = new URL("/login", request.url);

  if (!code) {
    loginUrl.searchParams.set("auth", "confirmation_failed");
    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    loginUrl.searchParams.set("auth", "confirmation_failed");
    return NextResponse.redirect(loginUrl);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    loginUrl.searchParams.set("auth", "confirmation_failed");
    return NextResponse.redirect(loginUrl);
  }

  await ensureAccountProfile({
    authUserId: user.id,
    email: user.email,
    userMetadata: user.user_metadata,
  });

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
