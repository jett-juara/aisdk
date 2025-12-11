"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Project } from "@/lib/collaboration/types";
import { VendorsTab } from "./vendors-tab";
import { ProjectsTab } from "./projects-tab";

interface AdminConsoleProps {
    user: User;
    vendors: any[];
    projects: Project[];
}

export function CollaborationAdminConsole({ user, vendors, projects }: AdminConsoleProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headingSecondary text-text-50">Collaboration Console</h1>
                    <p className="text-text-400 mt-1">Manage network, projects, and bids.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-200">Admin: {user.firstName}</span>
                </div>
            </div>

            <Tabs defaultValue="vendors" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="vendors">Vendors Management</TabsTrigger>
                    <TabsTrigger value="projects">Projects & Bids</TabsTrigger>
                </TabsList>

                <TabsContent value="vendors">
                    <VendorsTab vendors={vendors} />
                </TabsContent>

                <TabsContent value="projects">
                    <ProjectsTab projects={projects} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
