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
  fixed?: boolean;
}

const Footer = ({ className = "", fixed = false }: FooterProps) => {
  return (
    <footer className={`${className} bg-transparent`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center gap-3 text-white/90 lg:flex-row lg:justify-between lg:gap-4 lg:text-left text-center">
          {/* Copyright */}
          <div className="text-xs sm:text-sm text-white/70">
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
                className="group flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg border border-white/20 bg-black/20 text-white hover:bg-black/30 hover:text-white hover:ring-1 hover:ring-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 transition-colors duration-200 ease-out hover:scale-105 active:scale-95"
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
