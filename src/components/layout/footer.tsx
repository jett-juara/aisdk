import { Instagram, Linkedin, Mail } from "lucide-react";

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
  {
    icon: Mail,
    label: "Email",
    href: "mailto:contact@juaraevent.id",
  },
];

interface FooterProps {
  className?: string;
}

const Footer = ({ className = "" }: FooterProps) => {
  return (
    <footer className={`${className} bg-transparent relative`}>
      <div className="mx-auto max-w-6xl px-4 lg:px-8 py-6">
        <div className="flex flex-col items-center gap-3 text-text-50 lg:flex-row lg:justify-between lg:gap-4 lg:text-left text-center">
          {/* Copyright & Address */}
          <div className="flex flex-col gap-1">
            <div className="text-xs font-heading text-white/60 tracking-wider uppercase">
              Jl. Gudang Peluru Timur V Blok K No. 257, Tebet, Jakarta Selatan
            </div>
            <div className="text-xs font-heading text-white/40 tracking-wider uppercase">
              © {new Date().getFullYear()} JUARA Events. All rights reserved.
            </div>
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
                className="group flex h-8 w-8 items-center justify-center border-none bg-transparent text-white/40 hover:bg-transparent hover:text-white focus-visible:outline-none transition-all duration-300 ease-premium hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
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
