"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [errorEmail, setErrorEmail] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorEmail(null)
    const emailValid = /.+@.+\..+/.test(email)
    if (!emailValid) {
      setErrorEmail('Email tidak valid')
      return
    }
    // TODO: Implement actual forgot password logic
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Field (label in-input) */}
      <div className="flex flex-col gap-3">
        <Input
          id="email"
          type="email"
          placeholder="Email"
          aria-label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10 px-4 bg-input-bg-900 border-input-border-800 text-text-50 text-lg font-body font-semibold placeholder:text-input-placeholder-400 placeholder:opacity-0 placeholder-shown:placeholder:opacity-100 focus:placeholder:opacity-0 disabled:opacity-100 disabled:cursor-not-allowed focus:bg-[var(--color-text-50)] focus:text-text-900 selection:bg-[var(--color-background-800)] selection:text-[var(--color-text-50)]"
        />
        {errorEmail && <p className="text-xl text-auth-text-error mt-2">{errorEmail}</p>}
      </div>

      {/* Send Button (match primary button) */}
      <Button
        type="submit"
        className="w-full font-button font-medium text-md bg-button-primary text-text-100 hover:bg-button-primary-hover active:bg-button-primary-active tracking-wide rounded-lg transition-all duration-500 ease-out h-10"
      >
        Kirim tautan reset
      </Button>

      {/* Login Link */}
      <p className="text-center text-body text-sm text-text-200">
        Sudah punya akun?{" "}
        <a href="/auth" className="text-text-200 font-semibold hover:text-text-50 transition-colors underline">
          Masuk
        </a>
      </p>
    </form>
  )
}
