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
  { label: "About", href: "/about" },
  { label: "Product", href: "/product" },
  { label: "Services", href: "/services" },
  { label: "Collaboration", href: "#contact" },
];
