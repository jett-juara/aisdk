"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const emailValid = /.+@.+\..+/.test(email)
    if (!emailValid) {
      setError('Email tidak valid')
      return
    }
    setIsLoading(true)
    // TODO: Implement actual forgot password logic
    // TODO: Implement actual forgot password logic
    // Simulate API call
    setTimeout(() => {
      console.log("Forgot password request for:", email)
      setIsLoading(false)
      // On success, maybe redirect or show a success message
      // On failure, setError('Something went wrong. Please try again.')
    }, 2000)
  }

  const isValid = email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-left mx-auto w-[90%] md:w-[60%] lg:w-full lg:max-w-[640px]">
      {/* Email Field */}
      <div className="flex flex-col gap-3">
        <Input
          id="email"
          type="email"
          placeholder="Email"
          aria-label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className="h-12 px-4 bg-glass-bg border-glass-border text-text-50 text-md md:text-xl lg:text-sm font-body font-semibold placeholder:text-input-placeholder-400 placeholder:opacity-0 placeholder-shown:placeholder:opacity-100 focus:placeholder:opacity-0 disabled:opacity-100 disabled:cursor-not-allowed selection:bg-brand-500/20 selection:text-text-900 rounded-md backdrop-blur-md border focus:bg-input-focus-bg focus:text-text-900 transition-all duration-200"
        />
        {error && <p className="text-sm md:text-xl lg:text-sm text-text-error-500 px-4">{error}</p>}
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button
          type="submit"
          disabled={!isValid || isLoading}
          className="w-full font-button font-medium text-md md:text-xl lg:text-sm bg-button-primary text-text-50 hover:bg-button-primary-hover active:bg-button-primary-active tracking-wide transition-all duration-500 ease-out h-12 rounded-full hover:scale-105 disabled:bg-button-disabled disabled:text-text-400 disabled:opacity-100 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-text-50"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Memproses...
            </span>
          ) : (
            "Kirim Link Reset"
          )}
        </Button>
      </div>

      {/* Back to Login Link */}
      <div className="flex justify-center">
        <a
          href="/auth"
          className="text-text-200 transition-all duration-base text-sm md:text-lg lg:text-sm hover:text-text-50 focus-visible:text-brand-100 hover:underline hover:decoration-dotted hover:underline-offset-4 hover:decoration-1"
        >
          Kembali ke Login
        </a>
      </div>
    </form>
  )
}
