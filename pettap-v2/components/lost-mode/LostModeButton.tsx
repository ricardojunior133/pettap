"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";

import type { LostModeData } from "@/lib/lost-mode";

import LostModeModal from "./LostModeModal";
import LostModeSuccess from "./LostModeSuccess";

export default function LostModeButton({ data, active, onEnabled }: { data: LostModeData; active: boolean; onEnabled: () => void }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const confirm = () => { setIsConfirming(false); onEnabled(); setIsSuccessOpen(true); };
  return <>{active ? <div className="flex min-h-[84px] items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 text-rose-950 shadow-sm"><AlertTriangle className="h-5 w-5 shrink-0 text-rose-700" /><span><span className="block font-semibold">Lost Mode active</span><span className="mt-0.5 block text-sm text-rose-900/75">Emergency rescue experience is live.</span></span></div> : <button type="button" onClick={() => setIsConfirming(true)} className="flex min-h-[84px] items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 text-left text-rose-950 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-rose-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"><AlertTriangle className="h-5 w-5 shrink-0 text-rose-700" /><span><span className="block font-semibold">Enable Lost Mode</span><span className="mt-0.5 block text-sm text-rose-900/75">Make Charlie’s rescue page an emergency experience.</span></span></button>}{isConfirming && <LostModeModal data={data} onCancel={() => setIsConfirming(false)} onConfirm={confirm} />}{isSuccessOpen && <LostModeSuccess data={data} onClose={() => setIsSuccessOpen(false)} />}</>;
}
