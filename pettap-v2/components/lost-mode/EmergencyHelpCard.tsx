import { HandHeart } from "lucide-react";

import Card from "@/components/ui/Card";

export default function EmergencyHelpCard({ items }: { items: string[] }) {
  return <section aria-labelledby="emergency-help"><Card className="border-rose-100 bg-gradient-to-br from-white to-rose-50/50 p-5 sm:p-6"><div className="flex gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700"><HandHeart className="h-5 w-5" /></div><div><h2 id="emergency-help" className="font-semibold text-foreground">What should I do?</h2><ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">{items.map((item) => <li key={item} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />{item}</li>)}</ul></div></div></Card></section>;
}
