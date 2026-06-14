import type { ComponentProps } from "react";

type IconProps = ComponentProps<"svg">;

const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function HubIcon(p: IconProps) {
  return (
    <svg {...base} {...p} aria-hidden>
      <path d="M3 20 9.5 8l3.5 5.5L15 10l6 10z" />
      <path d="M9.5 8 12 12" />
    </svg>
  );
}

function FeastsIcon(p: IconProps) {
  return (
    <svg {...base} {...p} aria-hidden>
      <path d="M5 3v7a2 2 0 0 0 4 0V3M7 3v18" />
      <path d="M16 3c-1.5 0-2.5 2-2.5 5 0 2 1 3 2.5 3.2V21" />
    </svg>
  );
}

function ShoppingIcon(p: IconProps) {
  return (
    <svg {...base} {...p} aria-hidden>
      <path d="M3 4h2l2.2 11.2a1.5 1.5 0 0 0 1.5 1.2h8.3a1.5 1.5 0 0 0 1.5-1.1L21 7H6" />
      <circle cx="9.5" cy="20" r="1.2" />
      <circle cx="18" cy="20" r="1.2" />
    </svg>
  );
}

function CrewIcon(p: IconProps) {
  return (
    <svg {...base} {...p} aria-hidden>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M16 6.2a3 3 0 0 1 0 5.6M17.5 19a5.5 5.5 0 0 0-3-4.9" />
    </svg>
  );
}

function BasecampIcon(p: IconProps) {
  return (
    <svg {...base} {...p} aria-hidden>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10.5V20h14v-9.5" />
      <path d="M10 20v-5h4v5" />
    </svg>
  );
}

export type NavItem = {
  href: string;
  label: string;
  Icon: (p: IconProps) => React.ReactElement;
};

/** Five primary screens (FR labels — French is the default locale). */
export const navItems: NavItem[] = [
  { href: "/", label: "Accueil", Icon: HubIcon },
  { href: "/feasts", label: "Repas", Icon: FeastsIcon },
  { href: "/shopping", label: "Courses", Icon: ShoppingIcon },
  { href: "/crew", label: "Équipe", Icon: CrewIcon },
  { href: "/basecamp", label: "Chalet", Icon: BasecampIcon },
];
