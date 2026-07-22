import { HeartPulse, Info, ShieldCheck, Syringe, type LucideIcon } from "lucide-react";

import Card from "@/components/ui/Card";
import type { MedicalInformation as MedicalInformationData } from "@/src/lib/domain/rescue";

function MedicalItem({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value?: string }) {
  return (
    <div className="flex gap-4 border-b border-neutral-100 py-5 last:border-0">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
        <Icon className="h-5 w-5" strokeWidth={1.8} />
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{label}</h3>
        <p className="mt-1 leading-6 text-muted-foreground">{value ?? "No information has been shared by the owner."}</p>
      </div>
    </div>
  );
}

export default function MedicalInformation({ medicalInformation }: { medicalInformation: MedicalInformationData }) {
  return (
    <section aria-labelledby="medical-information" className="mt-12">
      <h2 id="medical-information" className="text-2xl font-semibold tracking-tight text-foreground">Medical information</h2>
      <Card className="mt-5 px-5 sm:px-6">
        <MedicalItem icon={HeartPulse} label="Medical conditions" value={medicalInformation.conditions} />
        <MedicalItem icon={Syringe} label="Medication" value={medicalInformation.medication} />
        <MedicalItem icon={ShieldCheck} label="Allergies" value={medicalInformation.allergies} />
        <MedicalItem icon={Info} label="Special notes" value={medicalInformation.notes} />
      </Card>
    </section>
  );
}
