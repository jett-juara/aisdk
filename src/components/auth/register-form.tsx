"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"

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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-4">
        <div className="flex flex-col gap-3">
          <Input
            id="firstName"
            type="text"
            placeholder="Nama depan"
            aria-label="Nama depan"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="h-12 px-4 bg-input-bg-900 border-input-border-800 text-text-50 text-lg sm:text-xl placeholder:text-input-placeholder-400 placeholder:font-manrope placeholder:opacity-0 placeholder-shown:placeholder:opacity-100 focus:placeholder:opacity-0"
          />
        </div>
        <div className="flex flex-col gap-3">
          <Input
            id="lastName"
            type="text"
            placeholder="Nama belakang"
            aria-label="Nama belakang"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="h-12 px-4 bg-input-bg-900 border-input-border-800 text-text-50 text-lg sm:text-xl placeholder:text-input-placeholder-400 placeholder:font-manrope placeholder:opacity-0 placeholder-shown:placeholder:opacity-100 focus:placeholder:opacity-0"
          />
        </div>
      </div>

      {/* Email Field */}
      <div className="flex flex-col gap-3">
        <Input
          id="email"
          type="email"
          placeholder="Email"
          aria-label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 px-4 bg-input-bg-900 border-input-border-800 text-text-50 text-lg sm:text-xl placeholder:text-input-placeholder-400 placeholder:font-manrope placeholder:opacity-0 placeholder-shown:placeholder:opacity-100 focus:placeholder:opacity-0"
        />
      </div>

      {/* Password Field */}
      <div className="flex flex-col gap-3">
        <Input
          id="password"
          type="password"
          placeholder="Kata sandi"
          aria-label="Kata sandi"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-12 px-4 bg-input-bg-900 border-input-border-800 text-text-50 text-lg sm:text-xl placeholder:text-input-placeholder-400 placeholder:font-manrope placeholder:opacity-0 placeholder-shown:placeholder:opacity-100 focus:placeholder:opacity-0"
        />
      </div>

      {/* Confirm Password Field */}
      <div className="flex flex-col gap-3">
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Konfirmasi kata sandi"
          aria-label="Konfirmasi kata sandi"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="h-12 px-4 bg-input-bg-900 border-input-border-800 text-text-50 text-lg sm:text-xl placeholder:text-input-placeholder-400 placeholder:font-manrope placeholder:opacity-0 placeholder-shown:placeholder:opacity-100 focus:placeholder:opacity-0"
        />
        {confirmError && <p className="text-xl text-auth-text-error mt-2">{confirmError}</p>}
      </div>

      {/* Register Button */}
      <Button type="submit" className="w-full h-12 font-heading text-lg sm:text-xl bg-button-primary text-text-50 hover:bg-button-primary-hover active:bg-button-primary-active font-semibold tracking-wide rounded-lg transition-all duration-500 ease-out">
        Daftar
      </Button>

      {/* Login Link */}
      <p className="text-center text-body text-lg sm:text-xl text-text-200">
        Sudah punya akun?{" "}
        <a href="/auth" className="text-text-200 font-semibold hover:text-text-50 transition-colors underline">
          Masuk
        </a>
      </p>
    </form>
  )
}
