import { AdminTimelineService } from "../services/admin-timeline-service";

export async function AdminAccountTimeline({ accountId }: { accountId: string }) {
  return <AdminTimeline items={await new AdminTimelineService().forAccount(accountId)} />;
}

export async function AdminPetTimeline({ petId }: { petId: string }) {
  return <AdminTimeline items={await new AdminTimelineService().forPet(petId)} />;
}

export async function AdminTagTimeline({ tagId }: { tagId: string }) {
  return <AdminTimeline items={await new AdminTimelineService().forTag(tagId)} />;
}

function AdminTimeline({ items }: { items: Awaited<ReturnType<AdminTimelineService["forAccount"]>> }) {
  if (!items.length) return <p className="rounded-2xl border border-dashed border-black/[0.12] bg-white p-6 text-sm text-neutral-600">No recent activity is available.</p>;
  return <ol className="space-y-3">{items.map((item) => <li className="rounded-2xl border border-black/[0.07] bg-white p-4" key={item.id}><p className="text-sm font-semibold">{item.title}</p>{item.detail ? <p className="mt-1 text-sm text-neutral-600">{item.detail}</p> : null}<time className="mt-2 block text-xs text-neutral-500">{new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.occurredAt))}</time></li>)}</ol>;
}
