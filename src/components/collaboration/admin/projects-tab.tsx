"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/lib/collaboration/types";
import { format } from "date-fns";
import { useState } from "react";
import { CreateProjectDialog } from "./create-project-dialog";
import { ProjectDetailDialog } from "./project-detail-dialog";

interface ProjectsTabProps {
    projects: Project[];
}

export function ProjectsTab({ projects }: ProjectsTabProps) {
    const [viewProject, setViewProject] = useState<Project | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    const handleManage = (project: Project) => {
        setViewProject(project);
        setDetailOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end items-center">
                <CreateProjectDialog />
            </div>

            <div className="rounded-xl border border-border-700 bg-background-900 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border-700 hover:bg-background-800/50">
                            <TableHead className="text-text-300">Title</TableHead>
                            <TableHead className="text-text-300">Status</TableHead>
                            <TableHead className="text-text-300">Budget</TableHead>
                            <TableHead className="text-text-300">Created</TableHead>
                            <TableHead className="text-text-300 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {projects.length === 0 ? (
                            <TableRow className="border-border-700">
                                <TableCell colSpan={5} className="h-32 text-center text-text-400">
                                    No projects found. Create one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            projects.map((project) => (
                                <TableRow key={project.id} className="border-border-700 hover:bg-background-800/50">
                                    <TableCell className="font-medium text-text-50">
                                        {project.title}
                                        <div className="text-xs text-text-400 font-normal truncate max-w-[200px]">
                                            {project.client_name || "Internal Project"}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={
                                                project.status === 'open' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                                    project.status === 'closed' ? "bg-background-800 text-text-400 border-border-700" :
                                                        "bg-brand-500/10 text-brand-500 border-brand-500/20"
                                            }
                                        >
                                            {project.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-text-200">
                                        {project.currency} {project.budget?.toLocaleString() || "-"}
                                    </TableCell>
                                    <TableCell className="text-text-300">
                                        {format(new Date(project.created_at!), "MMM d")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleManage(project)}
                                            className="text-brand-400 hover:text-brand-300 hover:bg-brand-500/10"
                                        >
                                            Manage
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <ProjectDetailDialog
                project={viewProject}
                open={detailOpen}
                onOpenChange={setDetailOpen}
            />
        </div>
    );
}
