"use client";

import { Vendor, User, Bid, VendorMessage } from "@/lib/collaboration/types";
import { VendorOverviewCards } from "./overview-cards";
import { VendorProfileSection } from "./profile-section";
import { VendorInvitationsSection } from "./invitations-section";
import { VendorMessagesSection } from "./messages-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRef } from "react";

interface VendorDashboardProps {
    user: User;
    vendor: Vendor;
    bids: Bid[];
    messages: VendorMessage[];
}

export function VendorDashboard({ user, vendor, bids, messages }: VendorDashboardProps) {
    const profileRef = useRef<HTMLDivElement>(null);

    // Calculate unread messages
    const unreadCount = messages.filter(m => !m.is_read).length;


    const scrollToProfile = () => {
        // Simple scroll to the profile tab content area if simpler, 
        // but since we are using Tabs, we might need to change the active tab if we want to "go to profile".
        // For now, let's assume the sections are stacked OR we just change tabs.
        // Actually, let's keep it simple: The dashboard has sections.
        // Section A: Overview
        // Section B: Profile
        // Section C: Projects
        // IF we use Tabs, scrollTo is tricky. Let's make it a stacked layout or Tabs.
        // Brief says: "Section A.. Section B..". 
        // Let's use a stacked layout for Overview + Tabs for Profile vs Projects to keep it clean, 
        // OR standard Dashboard layout.

        // Let's implement Tabs for "Overview" vs "Profile" vs "Projects" ?
        // Or keep Overview at top, and then tabs below.

        // Let's try: 
        // [Overview Cards]
        // [Tabs: Projects (Active) | Profile | Messages]

        // However, the task says "Section A... Section B...".
        // Let's stack them for now as per "ScrollTo" hint in Task 3.2.

        profileRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="space-y-6 pb-8">
            <div>
                <h1 className="text-3xl font-bold font-headingSecondary text-text-50 mb-2">Vendor Dashboard</h1>
                <p className="text-text-400">
                    Welcome back, {vendor.type === 'company' ? vendor.company_name : vendor.individual_name}.
                </p>
            </div>

            {/* Section A: Overview */}
            <section>
                <VendorOverviewCards
                    user={user}
                    vendor={vendor}
                    unreadMessagesCount={unreadCount}
                    scrollToProfile={scrollToProfile}
                />
            </section>

            {/* Main Content Area with Tabs */}
            <Tabs defaultValue="projects" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="projects">Projects & Bids</TabsTrigger>
                    <TabsTrigger value="messages">Messages</TabsTrigger>
                    <TabsTrigger value="profile">Profile & Docs</TabsTrigger>
                </TabsList>

                <TabsContent value="projects" className="mt-6 space-y-4">
                    <VendorInvitationsSection bids={bids} />
                </TabsContent>

                <TabsContent value="messages" className="mt-6 space-y-4">
                    <VendorMessagesSection messages={messages} />
                </TabsContent>

                <TabsContent value="profile" className="mt-6 space-y-4">
                    <div ref={profileRef}>
                        <VendorProfileSection vendor={vendor} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
