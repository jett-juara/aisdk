import React from "react";
import { CollaborationHero } from "@/components/collaboration/hero";

export const metadata = {
    title: "Collaboration | JETT",
    description: "Partner with Juara and grow your business.",
};

export default function CollaborationLandingPage() {
    return (
        <div className="flex flex-col items-center flex-1 w-full h-full min-h-0">
            <CollaborationHero />
        </div>
    );
}
