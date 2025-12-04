import React from "react";
import { CollaborationHero } from "@/components/collaboration/hero";
import { getImageGrid, getDetailBlocks } from "@/lib/cms/marketing";

export const metadata = {
    title: "Collaboration | JETT",
    description: "Partner with Juara and grow your business.",
};

export default async function CollaborationLandingPage() {
    const imageGridItems = await getImageGrid("collaboration", "hero_grid")
    const detailBlocks = await getDetailBlocks("collaboration")
    const detailMap = Object.fromEntries(detailBlocks.map((d) => [d.itemSlug, d]))
    return (
        <div className="flex flex-col items-center flex-1 w-full h-full min-h-0">
            <CollaborationHero imageGridItems={imageGridItems} detailBlocks={detailMap} />
        </div>
    );
}
