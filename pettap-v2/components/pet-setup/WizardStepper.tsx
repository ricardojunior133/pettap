import type { SetupProgress, WizardStep } from "@/lib/pet-setup";

export default function WizardStepper({ steps, current }: { steps: WizardStep[]; current: SetupProgress }) {
  const currentIndex = current === "success" ? steps.length : steps.findIndex((step) => step.id === current);
  return <ol aria-label="Pet setup progress" className="flex items-start justify-between gap-1 overflow-x-auto pb-2">{steps.map((step, index) => <li key={step.id} className="flex min-w-[72px] flex-1 items-center gap-2 last:flex-none"><div><span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${index < currentIndex ? "bg-[#111111] text-white" : index === currentIndex ? "bg-sky-100 text-sky-800" : "bg-neutral-100 text-muted-foreground"}`}>{index < currentIndex ? "✓" : index + 1}</span><span className={`mt-2 block whitespace-nowrap text-xs font-medium sm:text-sm ${index <= currentIndex ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</span></div>{index < steps.length - 1 && <span className="mb-6 h-px flex-1 bg-neutral-200" aria-hidden="true" />}</li>)}</ol>;
}
