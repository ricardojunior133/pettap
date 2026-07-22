import { AlertTriangle, CheckCircle2, Clock3, RefreshCw, XCircle } from "lucide-react";

import type { PetStatus } from "@/lib/lost-mode";

const details = { protected: { label: "Protected", icon: CheckCircle2, className: "bg-emerald-50 text-emerald-800" }, lost: { label: "Missing", icon: AlertTriangle, className: "bg-rose-50 text-rose-800" }, inactive: { label: "Inactive", icon: XCircle, className: "bg-neutral-100 text-neutral-700" }, pending: { label: "Pending", icon: Clock3, className: "bg-amber-50 text-amber-800" }, replacement: { label: "Replacement", icon: RefreshCw, className: "bg-sky-50 text-sky-800" } };

export default function EmergencyStatusBadge({ status }: { status: PetStatus }) {
  const { label, icon: Icon, className } = details[status];
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${className}`}><Icon className="h-4 w-4" />{label}</span>;
}
