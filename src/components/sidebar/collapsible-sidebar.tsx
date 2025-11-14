'use client'

import { useEffect } from 'react'
import type { ComponentType } from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { NavMain } from './nav-main'
import { SidebarHeader as JettSidebarHeader } from './sidebar-header'
import { SidebarFooter as JettSidebarFooter } from './sidebar-footer'
import type {
  DashboardNavSection,
  DashboardRole,
} from '@/lib/dashboard/navigation'
import { cn } from '@/lib/utils'

type SidebarUser = {
  name: string
  email: string
  role: DashboardRole
  status: string
}

type CollapsibleSidebarProps = {
  sections: DashboardNavSection[]
  user: SidebarUser
  className?: string
}

export function CollapsibleSidebar({ sections, user, className }: CollapsibleSidebarProps) {
  // Add keyboard shortcut for sidebar toggle (Ctrl/Cmd + B)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault()
        // Trigger sidebar toggle - this will be handled by SidebarProvider
        const sidebarToggle = document.querySelector('[data-sidebar="trigger"]')
        if (sidebarToggle instanceof HTMLElement) {
          sidebarToggle.click()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <TooltipProvider delayDuration={100}>
      <Sidebar
        collapsible="icon"
        className={cn(
          "border-r border-border-800 bg-background-900/50 backdrop-blur-sm",
          "transition-all duration-200 ease-linear",
          className
        )}
      >
        <JettSidebarHeader />
        <SidebarContent className="px-2 py-4">
          <NavMain sections={sections} />
        </SidebarContent>
        <JettSidebarFooter user={user} />
        <SidebarRail
          className="border-l border-border-800 bg-background-800/50 hover:bg-background-800 transition-colors duration-200"
        />
      </Sidebar>
    </TooltipProvider>
  )
}

// Export layout wrapper for integration with dashboard layout
export function DashboardSidebarLayout({
  sections,
  user,
  children,
}: {
  sections: DashboardNavSection[]
  user: SidebarUser
  children: React.ReactNode
}) {
  return (
    <Sidebar>
      <JettSidebarHeader />
      <SidebarContent className="px-2 py-4">
        <NavMain sections={sections} />
      </SidebarContent>
      <JettSidebarFooter user={user} />
      <SidebarRail
        className="border-l border-border-800 bg-background-800/50 hover:bg-background-800 transition-colors duration-200"
      />
    </Sidebar>
  )
}