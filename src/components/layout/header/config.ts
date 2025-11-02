export interface HeaderMenuItem {
  label: string;
  href: string;
  children?: Array<{
    label: string;
    href: string;
    description?: string;
  }>;
}

export const HEADER_MENU_ITEMS: HeaderMenuItem[] = [
  { label: "Product", href: "#product" },
  {
    label: "Services",
    href: "#services",
    children: [
      { label: "Strategy Lab", href: "#services-strategy", description: "Blueprint event" },
      { label: "Experience Design", href: "#services-experience", description: "Immersive journey" },
      { label: "Onsite Ops", href: "#services-operations", description: "Execution crew" },
    ],
  },
  { label: "Client", href: "#client" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "#contact" },
];
