import { Bell, HeartPulse, LockKeyhole, ScanLine, ShieldCheck, UserRound, type LucideIcon } from "lucide-react";
import Card from "@/components/ui/Card";
import type { PetWorkspace } from "@/lib/dashboard";

const items: { key: string; title: string; description: string; icon: LucideIcon }[] = [
  { key: "pet", title: "Pet information", description: "Name, breed, photo and everyday details.", icon: UserRound },
  { key: "owner", title: "Owner information", description: "Primary and emergency recovery contacts.", icon: ShieldCheck },
  { key: "emergency", title: "Emergency", description: "Medical notes and finder-facing instructions.", icon: HeartPulse },
  { key: "notifications", title: "Notifications", description: "Recovery and account update preferences.", icon: Bell },
  { key: "privacy", title: "Privacy", description: "Choose what a finder can see after a tap.", icon: LockKeyhole },
  { key: "tag", title: "Tag information", description: "Activation and NFC readiness for this PetTag.", icon: ScanLine },
];

export default function WorkspaceSettings({ pet }: { pet: PetWorkspace }) {
  return <section aria-labelledby="workspace-settings"><p className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-700">Account controls</p><h2 id="workspace-settings" className="mt-1 text-3xl font-semibold tracking-tight text-foreground">Settings for {pet.name}</h2><p className="mt-3 max-w-2xl leading-6 text-muted-foreground">Everything that shapes {pet.name}&apos;s PetTap profile, organised for calm updates when account syncing is connected.</p><Card className="mt-6 divide-y divide-neutral-100 px-5 sm:px-6">{items.map(({ key, title, description, icon: Icon }) => <div key={key} className="flex gap-4 py-5"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-sky-700"><Icon className="h-5 w-5" strokeWidth={1.8} /></div><div><h3 className="font-semibold text-foreground">{title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p></div><span className="ml-auto self-center text-xs font-medium text-neutral-400">Ready</span></div>)}</Card></section>;
}
