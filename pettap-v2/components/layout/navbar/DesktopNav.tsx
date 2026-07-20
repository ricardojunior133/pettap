import NavItem from "./NavItem";

const navigation = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "How it Works",
    href: "#how-it-works",
  },
  {
    label: "Features",
    href: "#features",
  },
  {
    label: "FAQ",
    href: "#faq",
  },
];

export default function DesktopNav() {
  return (
    <nav className="hidden items-center gap-8 lg:flex">
      {navigation.map((item) => (
        <NavItem
          key={item.label}
          href={item.href}
        >
          {item.label}
        </NavItem>
      ))}
    </nav>
  );
}