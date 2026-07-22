import { Phone, Stethoscope, UserRound } from "lucide-react";

import Card from "@/components/ui/Card";
import type { EmergencyContact, PetSetupContent } from "@/lib/pet-setup";

const icons = { "Primary Contact": UserRound, "Secondary Contact": Phone, Veterinarian: Stethoscope };

export default function ContactsStep({ contacts, content, onContinue }: { contacts: EmergencyContact[]; content: PetSetupContent["contacts"]; onContinue: () => void }) {
  return <section aria-labelledby="contacts-step"><p className="text-sm font-semibold uppercase tracking-[.16em] text-sky-700">Emergency contacts</p><h1 id="contacts-step" className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{content.title}</h1><p className="mt-3 leading-7 text-muted-foreground">{content.description}</p><div className="mt-8 space-y-3">{contacts.map((contact) => { const Icon = icons[contact.role]; return <Card key={contact.id} className="flex items-center gap-4 p-5"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700"><Icon className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="text-sm font-medium text-muted-foreground">{contact.role}</p><h2 className="mt-0.5 font-semibold text-foreground">{contact.name}</h2><p className="mt-1 text-sm text-muted-foreground">{contact.phone}{contact.availability ? ` · ${contact.availability}` : ""}</p></div></Card>; })}</div><button type="button" onClick={onContinue} className="mt-8 flex min-h-14 w-full items-center justify-center rounded-2xl bg-[#111111] px-6 font-semibold text-white shadow-[0_12px_28px_rgba(0,0,0,.14)] transition-all hover:-translate-y-0.5 hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600">{content.continue}</button></section>;
}
