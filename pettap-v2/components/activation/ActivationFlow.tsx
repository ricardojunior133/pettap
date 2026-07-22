"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import type { ActivationData, ActivationMethod, ActivationStatus } from "@/lib/activation";

import ActivationMethodView from "./ActivationMethod";
import ActivationSuccess from "./ActivationSuccess";
import ActivationSummary from "./ActivationSummary";
import ActivationWelcome from "./ActivationWelcome";
import ManualCodeForm from "./ManualCodeForm";
import NFCWaiting from "./NFCWaiting";
import PetSelection from "./PetSelection";

const progress: Record<ActivationStatus, number> = { welcome: 0, method: 1, reading: 1, assigning: 2, confirmation: 3, success: 3 };

export default function ActivationFlow({ data }: { data: ActivationData }) {
  const [status, setStatus] = useState<ActivationStatus>("welcome");
  const [method, setMethod] = useState<ActivationMethod>();
  const [selectedPetId, setSelectedPetId] = useState<string>();
  const [detected, setDetected] = useState(false);
  const reduceMotion = useReducedMotion();
  const selectedPet = useMemo(() => data.pets.find((pet) => pet.id === selectedPetId), [data.pets, selectedPetId]);

  useEffect(() => { if (status !== "reading" || method !== "nfc") return; const timer = window.setTimeout(() => setDetected(true), 1400); return () => window.clearTimeout(timer); }, [method, status]);

  const chooseMethod = (nextMethod: ActivationMethod) => { setDetected(false); setMethod(nextMethod); setStatus(nextMethod === "nfc" ? "reading" : "method"); };
  const detectedTag = () => setStatus("assigning");
  const content = status === "welcome" ? <ActivationWelcome {...data.content.welcome} onStart={() => setStatus("method")} /> : status === "method" && method === "manual-code" ? <ManualCodeForm content={data.content.methods.manual} onDetected={detectedTag} /> : status === "method" ? <ActivationMethodView content={data.content.methods} onChoose={chooseMethod} /> : status === "reading" ? <NFCWaiting content={data.content.nfc} detected={detected} onContinue={detectedTag} /> : status === "assigning" ? <PetSelection pets={data.pets} selectedPetId={selectedPetId} content={data.content.pets} onSelect={setSelectedPetId} onContinue={() => setStatus("confirmation")} /> : status === "confirmation" && selectedPet ? <ActivationSummary tag={data.tag} pet={selectedPet} content={data.content.confirmation} onActivate={() => setStatus("success")} /> : selectedPet ? <ActivationSuccess tag={data.tag} pet={selectedPet} content={data.content.success} /> : null;

  return <main className="min-h-screen bg-[#F6F7F8]"><div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-12"><div className="mx-auto max-w-2xl"><ol aria-label="Activation progress" className="flex items-center justify-between gap-2"><ProgressItem label="Welcome" complete={progress[status] > 0} active={progress[status] === 0} /><div className="h-px flex-1 bg-neutral-200" /><ProgressItem label="Connect" complete={progress[status] > 1} active={progress[status] === 1} /><div className="h-px flex-1 bg-neutral-200" /><ProgressItem label="Protect" complete={progress[status] > 2} active={progress[status] >= 2} /></ol></div><AnimatePresence mode="wait"><motion.div key={status} initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }} transition={{ duration: .22, ease: "easeOut" }} className="mt-8 rounded-[32px] border border-neutral-200 bg-white p-6 shadow-[0_20px_55px_rgba(0,0,0,.08)] sm:mt-10 sm:p-10">{content}</motion.div></AnimatePresence></div></main>;
}

function ProgressItem({ label, complete, active }: { label: string; complete: boolean; active: boolean }) { return <li className={`flex items-center gap-2 text-xs font-semibold sm:text-sm ${active || complete ? "text-foreground" : "text-muted-foreground"}`}><span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${complete ? "bg-[#111111] text-white" : active ? "bg-sky-100 text-sky-800" : "bg-neutral-100"}`}>{complete ? "✓" : ""}</span><span className="hidden sm:inline">{label}</span></li>; }
