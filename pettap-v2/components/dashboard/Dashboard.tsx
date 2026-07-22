import type { DashboardData } from "@/lib/dashboard";

import DashboardFooter from "./DashboardFooter";
import DashboardHeader from "./DashboardHeader";
import MyPets from "./MyPets";
import QuickActions from "./QuickActions";
import RecentActivity from "./RecentActivity";
import WelcomeCard from "./WelcomeCard";

export default function Dashboard({ data }: { data: DashboardData }) {
  return <div className="min-h-screen bg-[#F6F7F8]"><DashboardHeader owner={data.owner} navigation={data.navigation} /><main className="mx-auto max-w-6xl space-y-14 px-5 py-8 sm:px-8 sm:py-12"><WelcomeCard stats={data.stats} /><MyPets pets={data.pets} /><QuickActions actions={data.quickActions} /><RecentActivity activities={data.activities} /><DashboardFooter /></main></div>;
}
