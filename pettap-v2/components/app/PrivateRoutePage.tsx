import { AppShell, EmptyState, PageHeader } from "./AppShell";

export default function PrivateRoutePage({ title, description, emptyTitle, emptyDescription }: { title: string; description: string; emptyTitle: string; emptyDescription: string }) { return <AppShell><PageHeader title={title} description={description} /><EmptyState title={emptyTitle} description={emptyDescription} /></AppShell>; }
