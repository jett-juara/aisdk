import Link from "next/link";
import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";

const SOCIAL_LINKS = [
  { icon: Facebook, label: "Facebook", href: "https://facebook.com/juara" },
  { icon: Instagram, label: "Instagram", href: "https://instagram.com/juara" },
  { icon: Twitter, label: "Twitter", href: "https://x.com/juara" },
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com/company/juara" },
];

const QUICK_LINKS = [
  { label: "Tentang JUARA", href: "/about" },
  { label: "Layanan", href: "#services" },
  { label: "Portofolio", href: "#portfolio" },
  { label: "Artikel", href: "#insights" },
  { label: "Hubungi Kami", href: "#contact" },
  { label: "Kebijakan Privasi", href: "/privacy" },
];

const CONTACT_ITEMS = [
  { icon: Mail, label: "info@juara-events.com", href: "mailto:info@juara-events.com" },
  { icon: Phone, label: "+62 21 5555 1234", href: "tel:+622155551234" },
  { icon: MapPin, label: "Jakarta, Indonesia" },
];

const Footer = () => {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 xl:grid-cols-4">
          <div className="flex flex-col gap-6 sm:col-span-2 xl:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color:var(--color-auth-button-brand)] text-auth-text-primary">
                <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M11.3 1.046A1 1 0 0010 2v5H4a1 1 0 00-.82 1.573l7 10A1 1 0 0011 18v-5h6a1 1 0 00.82-1.573l-7-10a1 1 0 00-.68-.381z"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-brand text-xs uppercase tracking-[0.28em] text-auth-text-muted">JUARA</span>
                <span className="font-heading text-xl text-auth-text-primary">JETT</span>
              </div>
            </div>
            <p className="max-w-md font-body text-sm leading-relaxed text-auth-text-muted">
              JUARA memadukan strategi berbasis data, desain pengalaman, dan eksekusi teknologi buat bikin event
              off-the-grid yang nempel di ingatan audiens lo.
            </p>
            <ul className="flex flex-col gap-3">
              {CONTACT_ITEMS.map(({ icon: Icon, label, href }) => (
                <li key={label} className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border/40 text-auth-text-secondary">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">{label}</span>
                  </span>
                  {href ? (
                    <a
                      href={href}
                      className="inline-flex min-h-[44px] items-center font-body text-sm text-auth-text-primary transition-colors duration-200 hover:text-[color:var(--color-auth-button-brand)]"
                    >
                      {label}
                    </a>
                  ) : (
                    <span className="inline-flex min-h-[44px] items-center font-body text-sm text-auth-text-primary">
                      {label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <h3 className="font-heading text-sm uppercase tracking-[0.28em] text-auth-text-muted">Navigasi</h3>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {QUICK_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="inline-flex min-h-[44px] items-center font-body text-sm text-auth-text-muted transition-colors duration-200 hover:text-auth-text-primary focus-visible:outline-none focus-visible:text-auth-text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-border/30 bg-[color:var(--color-auth-surface-elevated)]/40 p-6">
              <h4 className="font-heading text-sm uppercase tracking-[0.24em] text-auth-text-muted">off the grid insight</h4>
              <p className="mt-3 font-body text-sm text-auth-text-secondary">
                Dapetin rangkuman event strategy dan update teknologi tiap bulan langsung ke email lo.
              </p>
              <Link
                href="/newsletter"
                className="mt-4 inline-flex items-center gap-2 font-heading text-sm text-[color:var(--color-auth-button-brand)] transition-colors duration-200 hover:text-[color:var(--color-auth-button-brand-hover)]"
              >
                Gabung Newsletter
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <h3 className="font-heading text-sm uppercase tracking-[0.28em] text-auth-text-muted">Ikuti Kami</h3>
              <p className="mt-4 font-body text-sm text-auth-text-secondary">
                Cerita behind the scene, eksperimen baru, dan highlight kolaborasi terbaru JUARA.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="flex h-11 w-11 items-center justify-center rounded-lg border border-border/30 text-auth-text-secondary transition-colors duration-200 hover:border-[color:var(--color-auth-button-brand)] hover:text-[color:var(--color-auth-button-brand)] focus-visible:outline-none focus-visible:border-[color:var(--color-auth-button-brand)]"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-border/30 p-4">
              <span className="font-brand text-xs uppercase tracking-[0.3em] text-auth-text-muted">Trusted by</span>
              <p className="mt-3 font-heading text-lg text-auth-text-primary">50+ corporate dan creative brands</p>
              <p className="mt-2 font-body text-xs uppercase tracking-[0.24em] text-auth-text-muted">
                dari Jakarta, Bali, sampai Singapura
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-border/30 pt-8 text-sm text-auth-text-muted md:flex-row md:items-center md:justify-between">
          <p className="font-body">
            © {new Date().getFullYear()} JUARA Events. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4 font-body">
            <Link
              href="/terms"
              className="text-sm text-auth-text-muted transition-colors duration-200 hover:text-auth-text-primary focus-visible:outline-none focus-visible:text-auth-text-primary"
            >
              Syarat & Ketentuan
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-auth-text-muted transition-colors duration-200 hover:text-auth-text-primary focus-visible:outline-none focus-visible:text-auth-text-primary"
            >
              Kebijakan Privasi
            </Link>
            <span className="hidden text-sm text-auth-text-muted md:inline">Designed for Off The Grid Experiences</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
