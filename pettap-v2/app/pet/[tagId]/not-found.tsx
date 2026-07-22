import Link from "next/link";
import { CircleHelp } from "lucide-react";

export default function RescueProfileNotFound() {
  return (
    <main className="flex min-h-screen items-center bg-[#F6F7F8] px-4 py-8">
      <section className="mx-auto w-full max-w-md rounded-[30px] bg-white p-8 text-center shadow-[0_24px_70px_rgba(0,0,0,.10)] sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
          <CircleHelp className="h-7 w-7" strokeWidth={1.8} />
        </div>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground">PetTap not found</h1>
        <p className="mt-3 leading-7 text-muted-foreground">This tag may not have been activated yet. Please check the link and try again.</p>
        <Link href="/" className="mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-neutral-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600">
          Visit PetTap
        </Link>
      </section>
    </main>
  );
}
