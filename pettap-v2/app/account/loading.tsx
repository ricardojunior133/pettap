import { Skeleton } from "@/components/ui/Skeleton";

export default function AccountLoading() {
  return <section aria-label="Loading your account" className="animate-pulse"><Skeleton className="h-3 w-28" /><Skeleton className="mt-4 h-12 w-72 max-w-full" /><Skeleton className="mt-4 h-6 w-full max-w-xl" /><div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-44" />)}</div><Skeleton className="mt-10 h-72 w-full" /></section>;
}
