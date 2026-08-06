import Link from "next/link";
import {
  Bell,
  ChevronRight,
  HeartPulse,
  LifeBuoy,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

const availableSettings = [
  {
    title: "Pet profiles",
    description: "Keep your pets’ names and basic information up to date.",
    href: "/dashboard/pets",
    icon: HeartPulse,
  },
  {
    title: "Notification preferences",
    description: "Choose how PetTap can keep you informed.",
    href: "/dashboard/settings/notifications",
    icon: Bell,
  },
  {
    title: "Privacy",
    description: "Read how PetTap handles information during the Coming Soon period.",
    href: "/privacy",
    icon: ShieldCheck,
  },
  {
    title: "Help and support",
    description: "Contact the PetTap team with account or product questions.",
    href: "/contact",
    icon: LifeBuoy,
  },
] as const;

export default function SettingsPage() {
  return (
    <section className="mx-auto max-w-4xl">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
        Account
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
        Settings
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600 sm:text-lg">
        Manage the PetTap areas that are available today and review what is
        coming next.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {availableSettings.map(({ title, description, href, icon: Icon }) => (
          <Link
            key={title}
            className="group rounded-3xl border border-black/[0.07] bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-[0_16px_35px_rgba(17,17,17,0.06)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/10"
            href={href}
          >
            <span className="flex size-10 items-center justify-center rounded-2xl bg-neutral-950 text-white">
              <Icon aria-hidden="true" className="size-4" />
            </span>
            <span className="mt-6 flex items-center justify-between gap-4 text-lg font-semibold tracking-[-0.03em]">
              {title}
              <ChevronRight
                aria-hidden="true"
                className="size-4 text-neutral-400 transition group-hover:translate-x-0.5"
              />
            </span>
            <span className="mt-2 block text-sm leading-6 text-neutral-600">
              {description}
            </span>
          </Link>
        ))}
      </div>

      <section className="mt-8 rounded-3xl border border-black/[0.07] bg-white p-6 sm:p-8">
        <div className="flex gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-700">
            <LockKeyhole aria-hidden="true" className="size-4" />
          </span>
          <div>
            <h2 className="text-lg font-semibold tracking-[-0.03em]">
              Account security
            </h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Password management and additional account controls are coming in
              a future update. Your current PetTap session remains protected.
            </p>
          </div>
        </div>
      </section>
    </section>
  );
}
