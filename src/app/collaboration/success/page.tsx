import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, LayoutDashboard } from "lucide-react";

export const metadata = {
    title: "Application Submitted | JETT",
    description: "Your vendor application has been submitted.",
};

export default function CollaborationSuccessPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="glass-panel p-8 md:p-12 rounded-3xl max-w-lg w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="relative mx-auto w-24 h-24">
                    <div className="absolute inset-0 bg-brand-500/20 rounded-full animate-ping" />
                    <div className="relative bg-brand-500 rounded-full w-24 h-24 flex items-center justify-center shadow-[0_0_30px_rgba(255,107,0,0.4)]">
                        <CheckCircle2 className="h-12 w-12 text-white" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="font-headingSecondary font-bold text-3xl md:text-4xl text-text-50">
                        Application Submitted!
                    </h1>
                    <p className="text-text-200 text-lg leading-relaxed">
                        Thank you for registering. Your application is now under review by our team. We will notify you via email once the verification process is complete.
                    </p>
                </div>

                <div className="pt-4">
                    <Button
                        asChild
                        className="h-12 px-8 rounded-full bg-brand-600 hover:bg-brand-700 text-white font-medium tracking-wide transition-all duration-300 hover:scale-105 shadow-lg w-full sm:w-auto"
                    >
                        <Link href="/setting">
                            <LayoutDashboard className="mr-2 h-5 w-5" />
                            Go to Dashboard
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
