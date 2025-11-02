'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

type RouteGuardProps = {
  allowedPaths: string[]
  fallbackPath: string
}

export function DashboardRouteGuard({ allowedPaths, fallbackPath }: RouteGuardProps) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!pathname) return
    const isAllowed = allowedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))
    if (!isAllowed) {
      router.replace(fallbackPath)
    }
  }, [allowedPaths, fallbackPath, pathname, router])

  return null
}
