import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

const SOCIAL_LINKS = [
  { icon: Facebook, label: "Facebook", href: "https://facebook.com/juara" },
  {
    icon: Instagram,
    label: "Instagram",
    href: "https://instagram.com/juara",
  },
  { icon: Twitter, label: "Twitter", href: "https://x.com/juara" },
  {
    icon: Linkedin,
    label: "LinkedIn",
    href: "https://linkedin.com/company/juara",
  },
];

interface FooterProps {
  className?: string;
}

const Footer = ({ className = "" }: FooterProps) => {
  return (
    <footer className={`absolute bottom-0 left-0 right-0 z-20 ${className}`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between text-footer-text-primary">
            {/* Copyright */}
            <div className="text-sm text-footer-text-secondary">
              © {new Date().getFullYear()} JUARA Events. All rights reserved.
            </div>

            {/* Social Links */}
            <div className="hidden md:flex gap-3">
              {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="group flex h-10 w-10 items-center justify-center rounded-lg border border-footer-border/60 bg-footer-button-surface text-footer-button-text hover:bg-footer-button-hover hover:text-footer-button-text-hover hover:ring-1 hover:ring-footer-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-footer-ring transition-colors duration-200 ease-out hover:scale-105 active:scale-95"
                >
                  <Icon className="h-[14px] w-[14px] md:h-4 md:w-4 transition-transform duration-200 group-hover:scale-110" />
                </a>
              ))}
            </div>
          </div>
      </div>
    </footer>
  );
};

export default Footer;
