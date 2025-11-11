import { Instagram, Linkedin } from "lucide-react";

const SOCIAL_LINKS = [
  {
    icon: Instagram,
    label: "Instagram",
    href: "https://instagram.com/juara",
  },
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
    <footer className={`${className} bg-transparent`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center gap-3 text-text-50 lg:flex-row lg:justify-between lg:gap-4 lg:text-left text-center">
          {/* Copyright */}
          <div className="text-xs sm:text-sm text-text-400">
            © {new Date().getFullYear()} JUARA Events. All rights reserved.
          </div>

          {/* Social Links */}
          <div className="flex gap-2 sm:gap-3">
            {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="group flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg border border-border-800 bg-transparent text-text-50 hover:bg-transparent hover:text-brand-100 focus-visible:outline-none transition-colors duration-200 ease-out hover:scale-105 active:scale-95"
              >
                <Icon className="h-3 w-3 sm:h-[14px] sm:w-[14px] md:h-4 md:w-4 transition-transform duration-200 group-hover:scale-110" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
