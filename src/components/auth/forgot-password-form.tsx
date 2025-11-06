"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
      {/* Email Field */}
      <div className="flex flex-col gap-3">
        <Label htmlFor="email" className="font-manrope text-sm font-medium text-[var(--color-auth-text-primary)]">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="anda@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-[var(--color-auth-input-bg)] border-[var(--color-auth-input-border)] text-[var(--color-auth-text-primary)] placeholder:text-[var(--color-auth-input-placeholder)]"
        />
        {errorEmail && <p className="text-sm text-auth-text-error mt-2">{errorEmail}</p>}
      </div>

      {/* Send Button */}
      <Button
        type="submit"
        className="w-full bg-[var(--color-auth-button-brand)] text-[var(--color-auth-text-primary)] hover:bg-[var(--color-auth-button-brand-hover)] focus-visible:ring-[var(--color-auth-button-brand)]/20 font-manrope font-semibold"
      >
        Kirim tautan reset
      </Button>

      {/* Login Link */}
      <p className="text-center text-body text-auth-text-muted">
        Sudah punya akun?{" "}
        <Link
          href="/"
          className="text-auth-text-secondary font-semibold hover:text-auth-text-primary transition-colors underline"
        >
          Silakan login
        </Link>
      </p>
    </form>
  )
}
