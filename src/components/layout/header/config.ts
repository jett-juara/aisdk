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
  { label: "Services", href: "#services" },
  { label: "Client", href: "#client" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "#contact" },
];
