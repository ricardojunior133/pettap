import Link from "next/link";

type NavItemProps = {
  href: string;
  children: React.ReactNode;
};

export default function NavItem({
  href,
  children,
}: NavItemProps) {
  return (
    <Link
      href={href}
      className="relative text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
    >
      {children}
    </Link>
  );
}