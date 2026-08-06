"use client";

import Container from "@/components/ui/Container";
import { spacing } from "@/lib/theme/spacing";

import StudioControlsPanel from "./StudioControlsPanel";
import StudioHeader from "./StudioHeader";
import StudioNavigation from "./StudioNavigation";
import StudioPreviewPanel from "./StudioPreviewPanel";
import StudioProgress from "./StudioProgress";
import StudioSummary from "./StudioSummary";

export default function StudioShell() {
  return <main className="min-h-screen bg-[#fbfbfa] text-neutral-950"><StudioHeader /><div className="border-b border-black/[0.06] bg-white/70 py-4 backdrop-blur-sm"><StudioProgress /></div><Container className={spacing.sectionY}><div className="grid min-w-0 items-start gap-7 lg:grid-cols-[minmax(19rem,0.82fr)_minmax(0,1.18fr)] lg:gap-10"><aside className="min-w-0 space-y-5 lg:sticky lg:top-8"><StudioPreviewPanel /><StudioSummary /></aside><div className="min-w-0"><StudioControlsPanel /><StudioNavigation /></div></div></Container></main>;
}
