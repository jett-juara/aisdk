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
            <DialogContent className="sm:max-w-[600px] bg-background-800 !fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] z-50 border-white/10 p-0 overflow-hidden shadow-2xl">
                {/* Diagonal Glass Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 pointer-events-none z-0" />

                <div className="relative z-10 p-6 sm:p-8">
                    <DialogHeader>
                        <DialogTitle className="text-center mb-2">
                            <span className="font-headingSecondary font-bold text-3xl tracking-tighter text-premium-gradient leading-[1.1] pb-[0.1em]">
                                Become Our Vendor
                            </span>
                        </DialogTitle>
                        <DialogDescription className="text-center font-subheading text-md text-text-50">
                            Join the Juara ecosystem and unlock new opportunities for collaboration.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
                                <div className="h-12 w-12 rounded-full bg-brand-500/20 flex items-center justify-center mb-3">
                                    <Handshake className="h-6 w-6 text-text-50" />
                                </div>
                                <h3 className="font-semibold mb-1 text-text-50">Partnership</h3>
                                <p className="text-xs text-text-200">
                                    Collaborate on exclusive events and projects.
                                </p>
                            </div>
                            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
                                <div className="h-12 w-12 rounded-full bg-brand-500/20 flex items-center justify-center mb-3">
                                    <Building2 className="h-6 w-6 text-text-50" />
                                </div>
                                <h3 className="font-semibold mb-1 text-text-50">Growth</h3>
                                <p className="text-xs text-text-200">
                                    Expand your business reach with our network.
                                </p>
                            </div>
                            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
                                <div className="h-12 w-12 rounded-full bg-brand-500/20 flex items-center justify-center mb-3">
                                    <Trophy className="h-6 w-6 text-text-50" />
                                </div>
                                <h3 className="font-semibold mb-1 text-text-50">Recognition</h3>
                                <p className="text-xs text-text-200">
                                    Get verified and recognized as a trusted partner.
                                </p>
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
