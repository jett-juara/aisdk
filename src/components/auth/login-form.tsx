"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorEmail, setErrorEmail] = useState<string | null>(null)
  const [errorPassword, setErrorPassword] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorEmail(null)
    setErrorPassword(null)
    const emailValid = /.+@.+\..+/.test(email)
    if (!emailValid) {
      setErrorEmail('Email tidak valid')
      return
    }
    if (password.length < 1) {
      setErrorPassword('Password wajib diisi')
      return
    }
    // TODO: Implement actual login logic
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

      {/* Password Field */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <Label htmlFor="password" className="font-manrope text-sm font-medium text-[var(--color-auth-text-primary)]">
            Kata sandi
          </Label>
          <a
            href="/auth/forgot-password"
            className="text-body-sm text-[var(--color-auth-text-secondary)] hover:text-[var(--color-auth-text-primary)] transition-colors"
          >
            Lupa Password?
          </a>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[var(--color-auth-input-bg)] border-[var(--color-auth-input-border)] text-[var(--color-auth-text-primary)] placeholder:text-[var(--color-auth-input-placeholder)] pr-10"
          />
          {errorPassword && <p className="text-sm text-auth-text-error mt-2">{errorPassword}</p>}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-auto w-auto p-1 text-[var(--color-auth-text-secondary)] hover:text-[var(--color-auth-text-primary)] transition-colors"
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            )}
          </Button>
        </div>
      </div>

      {/* Login Button */}
      <Button
        type="submit"
        className="w-full bg-[var(--color-auth-button-brand)] text-[var(--color-auth-text-primary)] hover:bg-[var(--color-auth-button-brand-hover)] focus-visible:ring-[var(--color-auth-button-brand)]/20 font-manrope font-semibold"
      >
        Masuk
      </Button>

      {/* Register Link */}
      <p className="text-center text-body text-auth-text-muted">
        Tidak punya akun?{" "}
        <a
          href="/auth/register"
          className="text-auth-text-secondary font-semibold hover:text-auth-text-primary transition-colors underline"
        >
          Register sekarang
        </a>
      </p>
    </form>
  )
}
