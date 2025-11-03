import Link from "next/link";
import { Button } from "@/components/ui/button";

interface HeaderCallToActionProps {
  href?: string;
}

export const HeaderCallToAction = ({ href = "/auth/login" }: HeaderCallToActionProps) => (
  <Button
    asChild
    className="hidden rounded-lg bg-header-button-primary px-4 py-2 font-heading text-sm font-semibold text-header-button-primary-text transition-colors duration-200 hover:bg-header-button-primary-hover active:bg-header-button-primary-active md:inline-flex"
  >
    <Link href={href}>Login</Link>
  </Button>
);
