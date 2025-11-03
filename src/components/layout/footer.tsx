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
        <div className="border-t border-white/20 pt-8">
          <div className="flex items-center justify-between text-white">
            {/* Copyright */}
            <div className="text-sm text-white/70">
              © {new Date().getFullYear()} JUARA Events. All rights reserved.
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white/70 hover:bg-white/20 hover:text-white/90 transition-all duration-200"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;