import Link from "next/link";

import Container from "@/components/layout/Container";

const footerLinks = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#tags", label: "PetTap Essential" },
  { href: "/studio", label: "Studio" },
  { href: "/#faq", label: "FAQ" },
  { href: "/shipping", label: "Shipping" },
  { href: "/returns", label: "Returns" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export default function Footer() {
  return (
    <footer className="border-t border-black/[0.07] bg-white py-12">
      <Container>
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/" className="text-xl font-semibold tracking-[-0.04em] text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950">
              PetTap
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-6 text-neutral-500">
              A considered NFC pet tag, designed to make the journey home feel simpler.
            </p>
          </div>

          <nav className="flex max-w-lg flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-neutral-600" aria-label="Footer navigation">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <p className="mt-10 border-t border-black/[0.06] pt-6 text-xs text-neutral-400">
          © {new Date().getFullYear()} PetTap. NFC only. No QR codes.
        </p>
      </Container>
    </footer>
  );
}
