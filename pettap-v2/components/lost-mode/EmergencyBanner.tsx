import { AlertTriangle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export default function EmergencyBanner({ title, description }: { title: string; description: string }) {
  const reduceMotion = useReducedMotion();
  return <motion.aside initial={reduceMotion ? false : { opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .24 }} role="status" className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-950 shadow-sm"><div className="flex gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-600 text-white"><AlertTriangle className="h-5 w-5" /></div><div><p className="font-semibold">{title}</p><p className="mt-1 leading-6 text-rose-900/80">{description}</p></div></div></motion.aside>;
}
