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

interface DashboardFooterProps {
    className?: string;
}

export function DashboardFooter({ className = "" }: DashboardFooterProps) {
    return (
        <footer className={`${className} bg-transparent border-t border-white/5 relative z-10`}>
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-4">
                <div className="flex flex-col items-center gap-3 text-text-50 lg:flex-row lg:justify-between lg:gap-4 lg:text-left text-center">
                    {/* Copyright */}
                    <div className="flex flex-col gap-1">
                        <div className="text-xs font-body text-text-400 tracking-tight">
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
                                className="group flex h-8 w-8 items-center justify-center text-text-400 hover:text-text-50 transition-all duration-300 ease-premium hover:scale-110"
                            >
                                <Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
