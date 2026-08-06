import { AlertCircle, Heart, Phone, ShieldCheck, Stethoscope, UserRound } from "lucide-react";

function ScreenHeader({ eyebrow }: { eyebrow: string }) {
  return <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">{eyebrow}</p>;
}

export function NfcDetectedScreen() {
  return <div className="flex h-full flex-col justify-center bg-gradient-to-b from-sky-50 via-white to-slate-50 px-7 text-center">
    <div className="mx-auto flex size-16 items-center justify-center rounded-[1.35rem] bg-sky-500 text-white shadow-[0_14px_30px_rgba(14,116,144,0.22)]">
      <span className="text-2xl" aria-hidden="true">⌁</span>
    </div>
    <p className="mt-7 text-sm font-semibold text-slate-900">NFC detected</p>
    <h3 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-slate-950">PetTap</h3>
    <p className="mx-auto mt-4 max-w-[12rem] text-sm leading-6 text-slate-600">Hold near your phone to open this pet’s profile.</p>
    <span className="mx-auto mt-9 rounded-full border border-sky-200 bg-white px-4 py-2 text-[10px] font-semibold tracking-[0.14em] text-sky-700">READY TO TAP</span>
  </div>;
}

export function PetProfileScreen() {
  return <div className="h-full bg-white px-6 pb-6 pt-16 text-slate-950">
    <ScreenHeader eyebrow="PetTap profile" />
    <div className="mt-5 flex items-center gap-3">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-100 text-xl shadow-inner" aria-hidden="true">🐕</div>
      <div>
        <h3 className="text-xl font-semibold tracking-[-0.04em]">Charlie</h3>
        <p className="mt-0.5 text-xs text-slate-500">Golden Retriever · 3 years</p>
      </div>
    </div>
    <div className="mt-7 rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-semibold text-slate-800">Safe &amp; friendly</p>
      <p className="mt-1 text-[11px] leading-5 text-slate-500">This pet has a secure profile shared by their owner.</p>
    </div>
    <div className="mt-5 flex items-center gap-2 text-[11px] font-medium text-slate-600"><ShieldCheck className="size-3.5 text-slate-900" aria-hidden="true" /> Profile verified by their owner</div>
  </div>;
}

export function MedicalInformationScreen() {
  return <div className="h-full bg-white px-6 pb-6 pt-16 text-slate-950">
    <ScreenHeader eyebrow="PetTap profile" />
    <h3 className="mt-3 text-xl font-semibold tracking-[-0.04em]">Medical information</h3>
    <div className="mt-6 space-y-3">
      <InfoCard icon={Stethoscope} title="Medication" detail="None shared" />
      <InfoCard icon={AlertCircle} title="Allergy" detail="No allergies shared" />
      <InfoCard icon={Heart} title="Vet notes" detail="Contact owner if concerned" />
    </div>
    <p className="mt-6 text-[11px] leading-5 text-slate-500">Only information chosen by the owner is shown here.</p>
  </div>;
}

export function EmergencyContactsScreen() {
  return <div className="h-full bg-white px-6 pb-6 pt-16 text-slate-950">
    <ScreenHeader eyebrow="PetTap profile" />
    <h3 className="mt-3 text-xl font-semibold tracking-[-0.04em]">Emergency contacts</h3>
    <div className="mt-6 space-y-3">
      <ContactCard title="Primary owner" name="Sarah W." />
      <ContactCard title="Emergency contact" name="James W." />
    </div>
    <p className="mt-6 text-[11px] leading-5 text-slate-500">Please call if you can help Charlie get home.</p>
  </div>;
}

export function ReunitedScreen() {
  return <div className="flex h-full flex-col justify-center bg-gradient-to-b from-rose-50 via-white to-amber-50 px-7 text-center text-slate-950">
    <div className="mx-auto flex size-16 items-center justify-center rounded-[1.35rem] bg-rose-100 text-3xl shadow-inner" aria-hidden="true">❤️</div>
    <h3 className="mt-7 text-2xl font-semibold tracking-[-0.055em]">Pet safely reunited</h3>
    <p className="mt-3 text-sm font-medium text-slate-700">Thank you!</p>
    <p className="mx-auto mt-4 max-w-[13rem] text-sm leading-6 text-slate-600">Each tap helps bring pets home.</p>
  </div>;
}

function InfoCard({ icon: Icon, title, detail }: { icon: typeof Stethoscope; title: string; detail: string }) {
  return <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
    <span className="flex size-8 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm"><Icon className="size-3.5" aria-hidden="true" /></span>
    <div><p className="text-xs font-semibold">{title}</p><p className="mt-0.5 text-[11px] text-slate-500">{detail}</p></div>
  </div>;
}

function ContactCard({ title, name }: { title: string; name: string }) {
  return <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5"><span className="flex size-8 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm"><UserRound className="size-3.5" aria-hidden="true" /></span><div><p className="text-[10px] font-medium text-slate-500">{title}</p><p className="text-xs font-semibold text-slate-900">{name}</p></div></div>
      <span className="flex size-8 items-center justify-center rounded-xl bg-slate-950 text-white"><Phone className="size-3.5" aria-hidden="true" /><span className="sr-only">Call {title}</span></span>
    </div>
  </div>;
}

export const phoneScreens = [NfcDetectedScreen, PetProfileScreen, MedicalInformationScreen, EmergencyContactsScreen, ReunitedScreen] as const;
