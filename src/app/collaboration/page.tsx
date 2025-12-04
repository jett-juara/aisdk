import React from "react";
import { CollaborationHero } from "@/components/collaboration/hero";
import { getImageGrid } from "@/lib/cms/marketing";

export const metadata = {
    title: "Collaboration | JETT",
    description: "Partner with Juara and grow your business.",
};

export default async function CollaborationLandingPage() {
    const imageGridItems = await getImageGrid("collaboration", "hero_grid")
    return (
        <div className="flex flex-col items-center flex-1 w-full h-full min-h-0">
            <CollaborationHero imageGridItems={imageGridItems} />
        </div>
    );
}
