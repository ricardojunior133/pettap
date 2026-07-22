import { CheckCircle2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import type { LostModeData } from "@/lib/lost-mode";

export default function LostModeSuccess({ data, onClose }: { data: LostModeData; onClose: () => void }) {
  const reduceMotion = useReducedMotion();
  return <div role="dialog" aria-modal="true" aria-labelledby="lost-mode-success-title" className="fixed inset-0 z-[70] flex items-end bg-black/35 p-4 sm:items-center sm:justify-center"><motion.div initial={reduceMotion ? false : { opacity: 0, y: 12, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: .2 }} className="w-full max-w-md rounded-[30px] bg-white p-6 text-center shadow-2xl"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><CheckCircle2 className="h-7 w-7" /></div><h2 id="lost-mode-success-title" className="mt-6 text-2xl font-semibold tracking-tight text-foreground">{data.success.title}</h2><p className="mt-3 leading-7 text-muted-foreground">{data.success.description}</p><button type="button" onClick={onClose} className="mt-8 min-h-13 w-full rounded-2xl bg-[#111111] px-5 font-semibold text-white transition-colors hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600">{data.success.action}</button></motion.div></div>;
}
