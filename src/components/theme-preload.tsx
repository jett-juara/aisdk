"use client"

import { useServerInsertedHTML } from "next/navigation"
import { useState } from "react"

export function ThemePreload() {
  const [hasRendered, setHasRendered] = useState(false)

  useServerInsertedHTML(() => {
    if (!hasRendered) {
      setHasRendered(true)
      return (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function getThemePreference() {
                  const stored = localStorage.getItem('theme')
                  if (stored) {
                    return stored
                  }
                  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
                }

                const theme = getThemePreference()
                document.documentElement.classList.toggle('dark', theme === 'dark')
              })()
            `,
          }}
        />
      )
    }
    return null
  })

  return null
}