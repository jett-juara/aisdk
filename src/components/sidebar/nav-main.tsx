'use client'

import { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import type { DashboardNavSection, DashboardIconKey } from '@/lib/dashboard/navigation'
import {
  BarChart3,
  LayoutDashboard,
  LockKeyhole,
  Settings2,
  Users,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

const ICON_MAP: Record<DashboardIconKey, any> = {
  'layout-dashboard': LayoutDashboard,
  'settings': Settings2,
  'users': Users,
  'permissions': LockKeyhole,
  'invitations': Settings2,
  'analytics': BarChart3,
}

const FALLBACK_ICON = Settings2

type NavMainProps = {
  sections: DashboardNavSection[]
  className?: string
}

export function NavMain({ sections, className }: NavMainProps) {
  const pathname = usePathname()

  const processedSections = useMemo(() => {
    return sections.map((section) => ({
      ...section,
      items: section.items.map((item) => ({
        ...item,
        isActive: pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`)),
        icon: ICON_MAP[item.icon] ?? FALLBACK_ICON,
      }))
    }))
  }, [sections, pathname])

  return (
    <>
      {processedSections.map((section) => (
        <SidebarGroup key={section.title} className={className}>
          <SidebarGroupLabel
            className="text-text-200 hover:bg-background-800 hover:text-text-50 transition-colors duration-200"
          >
            {section.title}
          </SidebarGroupLabel>
          <SidebarMenu>
            {section.items.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={cn(
                    "hover:bg-background-800 hover:text-text-50 transition-colors duration-200",
                    item.isActive && "bg-brand-500/20 text-brand-400 hover:bg-brand-500/30"
                  )}
                >
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    {item.isActive && (
                      <div className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-400" />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  )
}