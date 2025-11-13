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
      <div className="mx-auto max-w-6xl px-4 lg:px-8 py-6">
        <div className="flex flex-col items-center gap-3 text-text-50 lg:flex-row lg:justify-between lg:gap-4 lg:text-left text-center">
          {/* Copyright */}
          <div className="text-xs font-heading text-text-400">
            © {new Date().getFullYear()} JUARA Events. All rights reserved.
          </div>

          {/* Social Links */}
          <div className="flex gap-6">
            {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="group flex h-8 w-8 items-center justify-center border-none bg-transparent text-text-400 hover:bg-transparent hover:text-brand-100 focus-visible:outline-none transition-colors duration-200 ease-out hover:scale-105 active:scale-95"
              >
                <Icon className="h-8 w-8 lg:h-6 lg:w-6 transition-transform duration-200 group-hover:scale-110" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
