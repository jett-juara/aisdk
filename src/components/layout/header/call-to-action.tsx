import Link from "next/link";
import { Button } from "@/components/ui/button";

interface HeaderCallToActionProps {
  href?: string;
}

export const HeaderCallToAction = ({ href = "/auth/login" }: HeaderCallToActionProps) => (
  <Button
    asChild
    className="hidden rounded-lg bg-[color:var(--color-auth-button-brand)] px-4 py-2 font-heading text-sm font-semibold text-auth-text-primary transition-colors duration-200 hover:bg-[color:var(--color-auth-button-brand-hover)] md:inline-flex"
  >
    <Link href={href}>Login</Link>
  </Button>
);
