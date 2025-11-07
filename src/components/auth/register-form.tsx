"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterForm() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [confirmError, setConfirmError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setConfirmError(null)
    if (password !== confirmPassword) {
      setConfirmError('Konfirmasi password tidak cocok')
      return
    }
    // TODO: Implement actual registration logic (integration with /api/auth/register)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-3">
          <Label htmlFor="firstName" className="font-manrope text-sm font-medium text-[var(--color-auth-text-primary)]">
            Nama depan
          </Label>
          <Input
            id="firstName"
            type="text"
            placeholder="John"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="bg-[var(--color-auth-input-bg)] border-[var(--color-auth-input-border)] text-[var(--color-auth-text-primary)] placeholder:text-[var(--color-auth-input-placeholder)]"
          />
        </div>
        <div className="flex flex-col gap-3">
          <Label htmlFor="lastName" className="font-manrope text-sm font-medium text-[var(--color-auth-text-primary)]">
            Nama belakang
          </Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="bg-[var(--color-auth-input-bg)] border-[var(--color-auth-input-border)] text-[var(--color-auth-text-primary)] placeholder:text-[var(--color-auth-input-placeholder)]"
          />
        </div>
      </div>

      {/* Email Field */}
      <div className="flex flex-col gap-3">
        <Label htmlFor="email" className="font-manrope text-sm font-medium text-[var(--color-auth-text-primary)]">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="john.doe@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-[var(--color-auth-input-bg)] border-[var(--color-auth-input-border)] text-[var(--color-auth-text-primary)] placeholder:text-[var(--color-auth-input-placeholder)]"
        />
      </div>

      {/* Password Field */}
      <div className="flex flex-col gap-3">
        <Label htmlFor="password" className="font-manrope text-sm font-medium text-[var(--color-auth-text-primary)]">
          Kata sandi
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-[var(--color-auth-input-bg)] border-[var(--color-auth-input-border)] text-[var(--color-auth-text-primary)] placeholder:text-[var(--color-auth-input-placeholder)]"
        />
      </div>

      {/* Confirm Password Field */}
      <div className="flex flex-col gap-3">
        <Label htmlFor="confirmPassword" className="font-manrope text-sm font-medium text-[var(--color-auth-text-primary)]">
          Konfirmasi kata sandi
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="bg-[var(--color-auth-input-bg)] border-[var(--color-auth-input-border)] text-[var(--color-auth-text-primary)] placeholder:text-[var(--color-auth-input-placeholder)]"
        />
        {confirmError && <p className="text-sm text-auth-text-error mt-2">{confirmError}</p>}
      </div>

      {/* Register Button */}
      <Button
        type="submit"
        variant="jetta"
        size="md"
        className="w-full font-manrope font-semibold"
      >
        Daftar
      </Button>

      {/* Login Link */}
      <p className="text-center text-body text-auth-text-muted">
        Sudah punya akun?{" "}
        <a
          href="/auth"
          className="text-auth-text-secondary font-semibold hover:text-auth-text-primary transition-colors underline"
        >
          Masuk
        </a>
      </p>
    </form>
  )
}
