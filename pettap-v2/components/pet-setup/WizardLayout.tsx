"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import type { PetSetupData, SetupProgress } from "@/lib/pet-setup";

import BasicInfoStep from "./BasicInfoStep";
import ContactsStep from "./ContactsStep";
import HealthStep from "./HealthStep";
import PhotoStep from "./PhotoStep";
import ReviewStep from "./ReviewStep";
import SuccessStep from "./SuccessStep";
import WizardStepper from "./WizardStepper";

export default function WizardLayout({ data }: { data: PetSetupData }) {
  const [progress, setProgress] = useState<SetupProgress>("photo");
  const [setup, setSetup] = useState(data.setup);
  const [simulatedUpload, setSimulatedUpload] = useState(false);
  const reduceMotion = useReducedMotion();
  const next = (current: SetupProgress) => { const index = data.content.steps.findIndex((step) => step.id === current); setProgress(data.content.steps[index + 1]?.id ?? "success"); };
  const content = progress === "photo" ? <PhotoStep photo={setup.photo} content={data.content.photo} simulatedUpload={simulatedUpload} onUpload={() => setSimulatedUpload(true)} onContinue={() => next("photo")} /> : progress === "basic" ? <BasicInfoStep setup={setup} content={data.content.basic} onChange={(field, value) => setSetup((current) => ({ ...current, [field]: value }))} onContinue={() => next("basic")} /> : progress === "health" ? <HealthStep health={setup.health} content={data.content.health} onChange={(field, value) => setSetup((current) => ({ ...current, health: { ...current.health, [field]: value } }))} onContinue={() => next("health")} /> : progress === "contacts" ? <ContactsStep contacts={setup.contacts} content={data.content.contacts} onContinue={() => next("contacts")} /> : progress === "review" ? <ReviewStep setup={setup} content={data.content.review} onFinish={() => setProgress("success")} /> : <SuccessStep setup={setup} content={data.content.success} />;
  return <main className="min-h-screen bg-[#F6F7F8]"><div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-12"><div className="mx-auto max-w-2xl"><p className="text-center text-sm font-semibold uppercase tracking-[.16em] text-sky-700">PetTap setup</p><h1 className="mt-2 text-center text-2xl font-semibold tracking-tight text-foreground">{data.content.title}</h1><p className="mx-auto mt-2 max-w-xl text-center leading-6 text-muted-foreground">{data.content.description}</p><div className="mt-8"><WizardStepper steps={data.content.steps} current={progress} /></div></div><AnimatePresence mode="wait"><motion.div key={progress} initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }} transition={{ duration: .22, ease: "easeOut" }} className="mx-auto mt-8 max-w-3xl rounded-[32px] border border-neutral-200 bg-white p-6 shadow-[0_20px_55px_rgba(0,0,0,.08)] sm:mt-10 sm:p-10">{content}</motion.div></AnimatePresence></div></main>;
}
