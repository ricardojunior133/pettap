import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return <div aria-hidden="true" className="space-y-6"><Skeleton className="h-32 max-w-xl rounded-3xl" /><div className="grid gap-4 sm:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <Skeleton className="h-44 rounded-3xl" key={index} />)}</div><Skeleton className="h-52 rounded-3xl" /></div>;
}
