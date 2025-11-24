"use client";

import { HeaderLogo } from "@/components/layout/header/logo";
import { AuthGridBackground } from "@/components/auth/auth-grid-background";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email");
    const title = "Periksa Email";

    return (
        <section className="bg-background-800 md:bg-background-800 lg:bg-background-900 min-h-screen">
            {/* Mobile & Tablet Layout - Tanpa Card */}
            <div className="lg:hidden min-h-screen flex flex-col px-0 py-0">
                {/* Logo untuk mobile & tablet */}
                <div className="h-20 flex items-center px-4">
                    <HeaderLogo size="sm" className="md:hidden" />
                    <HeaderLogo size="md" className="hidden md:flex" />
                </div>

                {/* Header + Content dalam satu container untuk mobile & tablet */}
                <div className="flex-1 flex flex-col justify-center">
                    <div className="max-w-full mx-auto w-full space-y-8">
                        {/* Header */}
                        {title && (
                            <div className="text-center mx-auto w-[90%] md:w-[60%]">
                                <h1 className="font-headingSecondary font-bold text-3xl md:text-5xl tracking-tighter text-premium-gradient leading-[1.1] pb-[0.1em]">{title}</h1>
                            </div>
                        )}
                        {/* Content */}
                        <div className="mx-auto w-[90%] md:w-[60%] space-y-8">
                            <p className="text-text-200 text-sm md:text-base text-center">
                                Tautan telah terkirim ke: {email && <span className="text-brand-300 font-semibold">{email}</span>}. Klik untuk mengaktifkan akun.
                            </p>

                            <div className="flex flex-col gap-4">
                                <Link href="/auth" className="w-full">
                                    <Button
                                        className="w-full font-button font-medium text-md md:text-xl lg:text-sm bg-button-primary text-text-50 hover:bg-button-primary-hover active:bg-button-primary-active tracking-wide transition-all duration-500 ease-out h-12 rounded-full hover:scale-105"
                                    >
                                        Kembali ke Login
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Layout - Card Design */}
            <div className="hidden lg:flex min-h-screen items-center justify-center px-4 relative overflow-hidden">
                <AuthGridBackground />
                <div className="w-full max-w-md glass-card-premium lg:p-8 z-10">
                    {/* Logo */}
                    <div className="h-8 mb-4 flex items-center justify-center">
                        <HeaderLogo size="sm" />
                    </div>

                    {/* Header */}
                    {title && (
                        <div className="mb-6 text-center">
                            <h1 className="font-headingSecondary font-bold lg:text-3xl tracking-tighter text-premium-gradient leading-[1.1] pb-[0.1em]">{title}</h1>
                        </div>
                    )}

                    {/* Content */}
                    <div className="space-y-6">
                        <p className="text-text-200 text-sm text-center">
                            Tautan telah terkirim ke: {email && <span className="text-brand-300 font-semibold">{email}</span>}. Klik untuk mengaktifkan akun.
                        </p>

                        <div className="flex flex-col gap-4">
                            <Link href="/auth" className="w-full">
                                <Button
                                    className="w-full font-button font-medium text-sm bg-button-primary text-text-50 hover:bg-button-primary-hover active:bg-button-primary-active tracking-wide transition-all duration-500 ease-out h-12 rounded-full hover:scale-105"
                                >
                                    Kembali ke Login
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
