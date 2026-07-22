"use client";

import { useState } from "react";

import EmergencyBanner from "@/components/lost-mode/EmergencyBanner";
import EmergencyHelpCard from "@/components/lost-mode/EmergencyHelpCard";
import EmergencyStatusBadge from "@/components/lost-mode/EmergencyStatusBadge";
import EmergencyTimeline from "@/components/lost-mode/EmergencyTimeline";
import LostModeButton from "@/components/lost-mode/LostModeButton";
import type { PetWorkspace } from "@/lib/dashboard";
import type { LostModeData } from "@/lib/lost-mode";

import ActionBar from "./ActionBar";
import OverviewTab from "./OverviewTab";
import WorkspaceHeader from "./WorkspaceHeader";
import WorkspaceTabs from "./WorkspaceTabs";
import WorkspaceSettings from "./WorkspaceSettings";

export default function WorkspaceInteractive({ pet, lostModeData }: { pet: PetWorkspace; lostModeData: LostModeData }) {
  const [isLost, setIsLost] = useState(pet.lostMode);
  const [activeTab, setActiveTab] = useState("Overview");
  const status = isLost ? "lost" : "protected";
  const standardActions = pet.actions.filter((action) => action.icon !== "alert");
  return <div className="min-h-screen bg-[#F6F7F8]"><WorkspaceHeader pet={pet} /><main className="mx-auto max-w-6xl space-y-8 px-5 py-8 sm:px-8 sm:py-12">{isLost && <EmergencyBanner title={lostModeData.banner.title} description={lostModeData.banner.description} />}<div className="flex items-center justify-between gap-4"><WorkspaceTabs tabs={pet.tabs} activeLabel={activeTab} onSelect={setActiveTab} /><EmergencyStatusBadge status={status} /></div>{activeTab === "Overview" ? <><ActionBar actions={standardActions}><LostModeButton data={lostModeData} active={isLost} onEnabled={() => setIsLost(true)} /></ActionBar><OverviewTab pet={pet} lostMode={isLost} />{isLost && <div className="grid gap-8 lg:grid-cols-2"><EmergencyHelpCard items={lostModeData.helpItems} /><EmergencyTimeline events={lostModeData.timeline} /></div>}</> : activeTab === "Settings" ? <WorkspaceSettings pet={pet} /> : <section className="rounded-3xl border border-neutral-200 bg-white p-7 shadow-sm"><p className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-700">{activeTab}</p><h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">A dedicated space for {activeTab.toLowerCase()}.</h2><p className="mt-3 max-w-xl leading-6 text-muted-foreground">This workspace section is prepared for the next account-connected release. {pet.name}&apos;s essential rescue information remains available in Overview today.</p></section>}</main></div>;
}
