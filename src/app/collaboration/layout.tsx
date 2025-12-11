import React from "react";
import type { Metadata } from "next";
import { CollaborationLayoutFrame } from "@/components/collaboration/collaboration-layout-frame";

export const metadata: Metadata = {
    title: "Collaboration | JETT",
    description: "Become a vendor partner with Juara.",
};

export default function CollaborationLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <CollaborationLayoutFrame>{children}</CollaborationLayoutFrame>;
}
