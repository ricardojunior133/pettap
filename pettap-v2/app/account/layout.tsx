import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AccountShell } from "@/components/account/AccountShell";
import { getCurrentUser } from "@/lib/backend/auth/get-current-user";

export const metadata: Metadata = {
  title: "Your account | PetTap",
  robots: { index: false, follow: false },
};

export default async function AccountLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <AccountShell email={user.email ?? null}>{children}</AccountShell>;
}
