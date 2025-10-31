"use client"

import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'

export default function Home() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background text-foreground">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold font-heading">
            JETT - AI Event Management Assistant
          </h1>
          <p className="text-xl text-body">
            Theme system test page
          </p>
        </div>

        <div className="auth-field-group max-w-md mx-auto">
          <h2 className="text-h2 text-center mb-8">Authentication Theme Test</h2>

          <div className="space-y-6">
            <div>
              <label className="auth-label">Email Address</label>
              <input
                type="email"
                className="auth-input"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="auth-label">Password</label>
              <input
                type="password"
                className="auth-input"
                placeholder="Enter your password"
              />
            </div>

            <button className="auth-button">
              Sign In
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold">Theme Information</h3>
          <p>Current Theme: <span className="font-mono bg-muted px-2 py-1 rounded">{mounted ? theme : 'dark'}</span></p>
          {mounted && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setTheme('dark')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
              >
                Dark Mode
              </button>
              <button
                onClick={() => setTheme('light')}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 transition-colors"
              >
                Light Mode
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Dark Mode Colors</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{backgroundColor: 'var(--color-auth-bg-form)'}}></div>
                <span>Auth Background</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{backgroundColor: 'var(--color-auth-button-brand)'}}></div>
                <span>Auth Button</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-sidebar"></div>
                <span>Sidebar</span>
              </div>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Typography Test</h4>
            <div className="space-y-1 text-sm">
              <p className="font-heading">Heading Font</p>
              <p className="font-body">Body Font</p>
              <p className="font-mono">Monospace Font</p>
              <p className="font-serif">Serif Font</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}