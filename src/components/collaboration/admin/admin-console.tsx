"use client";


import { User, Project } from "@/lib/collaboration/types";
import { VendorsTab } from "./vendors-tab";
import { ProjectsTab } from "./projects-tab";

// Determine title and description based on current view
interface AdminConsoleProps {
    user: User;
    vendors: any[];
    projects: Project[];
    currentView?: string;
}

export function CollaborationAdminConsole({ user, vendors, projects, currentView }: AdminConsoleProps) {
    let title = "Overview";
    let description = "Welcome back to the Collaboration Console.";

    if (currentView === 'vendors') {
        title = "Vendors Management";
        description = "Manage vendor applications and approvals";
    } else if (currentView === 'projects') {
        title = "Projects & Bids";
        description = "Manage open projects and view bids";
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headingSecondary text-text-50">{title}</h1>
                    <p className="text-text-400 mt-1">{description}</p>
                </div>
                {/* Admin badge removed as requested */}
            </div>

            <div className="mt-6">
                {currentView === 'vendors' && (
                    <VendorsTab vendors={vendors} />
                )}

                {currentView === 'projects' && (
                    <ProjectsTab projects={projects} />
                )}

                {(!currentView || currentView === 'overview') && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {/* Placeholder for Overview Stats if needed in future */}
                        <div className="p-6 rounded-xl bg-background-900 border border-border-700">
                            <h3 className="font-medium text-text-400">Total Vendors</h3>
                            <p className="text-2xl font-bold text-text-50 mt-2">{vendors.length}</p>
                        </div>
                        <div className="p-6 rounded-xl bg-background-900 border border-border-700">
                            <h3 className="font-medium text-text-400">Total Projects</h3>
                            <p className="text-2xl font-bold text-text-50 mt-2">{projects.length}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
