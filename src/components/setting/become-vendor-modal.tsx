"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building2, Handshake, Trophy } from "lucide-react";

interface BecomeVendorModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function BecomeVendorModal({
    open,
    onOpenChange,
}: BecomeVendorModalProps) {
    const router = useRouter();

    const handleBecomeVendor = () => {
        onOpenChange(false);
        router.push("/collaboration/register");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[90vw] sm:max-w-[600px] bg-background-800 !fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] z-50 border-white/10 p-0 overflow-hidden shadow-2xl rounded-2xl">
                {/* Diagonal Glass Effect Overlay */}
                <div className="absolute inset-0 pointer-events-none z-0" />

                <div className="relative z-10 p-5 sm:p-8">
                    <DialogHeader>
                        <DialogTitle className="text-center mb-2">
                            <span className="font-headingSecondary font-bold text-2xl sm:text-3xl tracking-tighter text-premium-gradient leading-[1.1] pb-[0.1em]">
                                Become Our Vendor
                            </span>
                        </DialogTitle>
                        <DialogDescription className="text-center font-subheading text-sm sm:text-md text-text-50">
                            Join the Juara ecosystem and unlock new opportunities for collaboration.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-3 lg:gap-4 py-4 lg:py-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
                            <div className="flex flex-row lg:flex-col items-center justify-start lg:justify-center text-left lg:text-center p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
                                <div className="h-14 w-14 lg:h-16 lg:w-16 rounded-full bg-brand-500/20 flex items-center justify-center mr-4 lg:mr-0 lg:mb-4 flex-shrink-0">
                                    <Handshake className="h-7 w-7 lg:h-8 lg:w-8 text-text-50" />
                                </div>
                                <div className="flex-1 lg:flex-none lg:contents">
                                    <h3 className="font-semibold mb-0.5 lg:mb-1 text-sm lg:text-base text-text-50">Partnership</h3>
                                    <p className="text-xs text-text-200 leading-tight">
                                        Collaborate on exclusive events and projects.
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-row lg:flex-col items-center justify-start lg:justify-center text-left lg:text-center p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
                                <div className="h-14 w-14 lg:h-16 lg:w-16 rounded-full bg-brand-500/20 flex items-center justify-center mr-4 lg:mr-0 lg:mb-4 flex-shrink-0">
                                    <Building2 className="h-7 w-7 lg:h-8 lg:w-8 text-text-50" />
                                </div>
                                <div className="flex-1 lg:flex-none lg:contents">
                                    <h3 className="font-semibold mb-0.5 lg:mb-1 text-sm lg:text-base text-text-50">Growth</h3>
                                    <p className="text-xs text-text-200 leading-tight">
                                        Expand your business reach with our network.
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-row lg:flex-col items-center justify-start lg:justify-center text-left lg:text-center p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
                                <div className="h-14 w-14 lg:h-16 lg:w-16 rounded-full bg-brand-500/20 flex items-center justify-center mr-4 lg:mr-0 lg:mb-4 flex-shrink-0">
                                    <Trophy className="h-7 w-7 lg:h-8 lg:w-8 text-text-50" />
                                </div>
                                <div className="flex-1 lg:flex-none lg:contents">
                                    <h3 className="font-semibold mb-0.5 lg:mb-1 text-sm lg:text-base text-text-50">Recognition</h3>
                                    <p className="text-xs text-text-200 leading-tight">
                                        Get verified and recognized as a trusted partner.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="sm:justify-center">
                        <Button
                            onClick={handleBecomeVendor}
                            className="w-full sm:w-auto min-w-[200px] font-button font-medium text-md bg-button-primary text-text-50 hover:bg-button-primary-hover active:bg-button-primary-active tracking-wide transition-all duration-500 ease-out h-12 rounded-full hover:scale-105 shadow-lg shadow-brand-900/20"
                            size="lg"
                        >
                            Become Our Vendor
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
