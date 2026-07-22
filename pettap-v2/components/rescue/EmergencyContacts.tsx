import { Mail, Phone, UserRound } from "lucide-react";

import type { EmergencyContact, RescueOwner } from "@/src/lib/domain/rescue";

type Contact = EmergencyContact | RescueOwner;

function ContactCard({ contact, relationship }: { contact: Contact; relationship: string }) {
  const phone = contact.phone.replace(/\s/g, "");

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
        <UserRound className="h-5 w-5" strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-foreground">{contact.name}</p>
        {contact.email && <a className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-sky-700 hover:underline" href={`mailto:${contact.email}`}><Mail className="h-3 w-3" />Email contact</a>}
        <p className="mt-0.5 text-sm text-muted-foreground">{relationship}{contact.availability ? ` · ${contact.availability}` : ""}</p>
      </div>
      <a href={`tel:${phone}`} aria-label={`Call ${contact.name}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white transition-colors hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600">
        <Phone className="h-5 w-5" />
      </a>
    </div>
  );
}

export default function EmergencyContacts({ owner, contacts }: { owner: RescueOwner; contacts: EmergencyContact[] }) {
  return (
    <section aria-labelledby="emergency-contacts" className="mt-12">
      <h2 id="emergency-contacts" className="text-2xl font-semibold tracking-tight text-foreground">Emergency contacts</h2>
      <div className="mt-5 space-y-3">
        <ContactCard contact={owner} relationship="Primary owner" />
        {owner.secondaryPhone && <ContactCard contact={{ name: owner.name, relationship: "Secondary phone", phone: owner.secondaryPhone }} relationship="Secondary phone" />}
        {contacts.map((contact) => <ContactCard key={`${contact.relationship}-${contact.phone}`} contact={contact} relationship={contact.relationship} />)}
      </div>
    </section>
  );
}
