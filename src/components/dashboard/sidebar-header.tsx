'use client'

import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import type { DashboardNavSection, DashboardRole } from '@/lib/dashboard/navigation'

type DashboardSidebarHeaderProps = {
  sections: DashboardNavSection[]
  role: DashboardRole
}

export function DashboardSidebarHeader({ sections, role }: DashboardSidebarHeaderProps) {
  const { toggleSidebar, open } = useSidebar()

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border-800 bg-background-900/50 backdrop-blur-sm">
      <Button
        data-sidebar="trigger"
        variant="ghost"
        size="sm"
        onClick={toggleSidebar}
        className="text-text-200 hover:text-text-50 hover:bg-background-800 transition-colors duration-200 h-7 w-7"
      >
        {open ? (
          <PanelLeftClose className="h-4 w-4" />
        ) : (
          <PanelLeftOpen className="h-4 w-4" />
        )}
      </Button>
      <div className="flex-1">
        <DashboardHeader sections={sections} role={role} />
      </div>
    </header>
  )
}