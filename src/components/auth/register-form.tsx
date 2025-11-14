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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
        <div className="flex flex-col">
          <Input
            id="firstName"
            type="text"
            placeholder="Nama depan"
            aria-label="Nama depan"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="h-10 md:h-14 lg:h-10 px-4 bg-input-bg-900 border-input-border-800 text-text-50 text-md md:text-xl lg:text-sm font-body font-semibold placeholder:text-input-placeholder-400 placeholder:opacity-0 placeholder-shown:placeholder:opacity-100 focus:placeholder:opacity-0 disabled:opacity-100 disabled:cursor-not-allowed focus:bg-[var(--color-text-50)] focus:text-text-900 selection:bg-[var(--color-background-800)] selection:text-[var(--color-text-50)]"
          />
        </div>
        <div className="flex flex-col">
          <Input
            id="lastName"
            type="text"
            placeholder="Nama belakang"
            aria-label="Nama belakang"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="h-10 md:h-14 lg:h-10 px-4 bg-input-bg-900 border-input-border-800 text-text-50 text-md md:text-xl lg:text-sm font-body font-semibold placeholder:text-input-placeholder-400 placeholder:opacity-0 placeholder-shown:placeholder:opacity-100 focus:placeholder:opacity-0 disabled:opacity-100 disabled:cursor-not-allowed focus:bg-[var(--color-text-50)] focus:text-text-900 selection:bg-[var(--color-background-800)] selection:text-[var(--color-text-50)]"
          />
        </div>
      {/* Email Field */}
      <div className="flex flex-col">
        <Input
          id="email"
          type="email"
          placeholder="Email"
          aria-label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10 md:h-14 lg:h-10 px-4 bg-input-bg-900 border-input-border-800 text-text-50 text-md md:text-xl lg:text-sm font-body font-semibold placeholder:text-input-placeholder-400 placeholder:opacity-0 placeholder-shown:placeholder:opacity-100 focus:placeholder:opacity-0 disabled:opacity-100 disabled:cursor-not-allowed focus:bg-[var(--color-text-50)] focus:text-text-900 selection:bg-[var(--color-background-800)] selection:text-[var(--color-text-50)]"
        />
      </div>

      {/* Password Field */}
      <div className="flex flex-col">
        <div className="relative group">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            aria-label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-10 md:h-14 lg:h-10 px-4 bg-input-bg-900 border-input-border-800 text-text-50 text-md md:text-xl lg:text-sm font-body font-semibold placeholder:text-input-placeholder-400 placeholder:opacity-0 placeholder-shown:placeholder:opacity-100 focus:placeholder:opacity-0 disabled:opacity-100 disabled:cursor-not-allowed focus:bg-[var(--color-text-50)] focus:text-text-900 selection:bg-[var(--color-background-800)] selection:text-[var(--color-text-50)]"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent hover:bg-transparent text-text-200 hover:text-text-50 group-focus-within:hover:text-[var(--color-text-900)] focus-visible:ring-0 focus-visible:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 md:w-5 md:h-5 lg:w-4 lg:h-4">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 md:w-5 md:h-5 lg:w-4 lg:h-4">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            )}
          </Button>
        </div>
      </div>

      {/* Confirm Password Field */}
      <div className="flex flex-col">
        <div className="relative group">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Konfirmasi Password"
            aria-label="Konfirmasi Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-10 md:h-14 lg:h-10 px-4 bg-input-bg-900 border-input-border-800 text-text-50 text-md md:text-xl lg:text-sm font-body font-semibold placeholder:text-input-placeholder-400 placeholder:opacity-0 placeholder-shown:placeholder:opacity-100 focus:placeholder:opacity-0 disabled:opacity-100 disabled:cursor-not-allowed focus:bg-[var(--color-text-50)] focus:text-text-900 selection:bg-[var(--color-background-800)] selection:text-[var(--color-text-50)]"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={showConfirmPassword ? "Sembunyikan konfirmasi password" : "Tampilkan konfirmasi password"}
            onClick={() => setShowConfirmPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent hover:bg-transparent text-text-200 hover:text-text-50 group-focus-within:hover:text-[var(--color-text-900)] focus-visible:ring-0 focus-visible:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {showConfirmPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 md:w-5 md:h-5 lg:w-4 lg:h-4">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 md:w-5 md:h-5 lg:w-4 lg:h-4">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            )}
          </Button>
        </div>
        {confirmError && <p className="text-xl text-auth-text-error mt-2">{confirmError}</p>}
      </div>
      {/* Register Button */}
      <div className="flex justify-center">
        <Button
          type="submit"
          className="w-full mt-2 md:mt-4 lg:mt-2 font-button font-medium text-md md:text-xl lg:text-sm bg-button-primary text-text-100 hover:bg-button-primary-hover active:bg-button-primary-active tracking-wide transition-all duration-500 ease-out h-10 md:h-14 lg:h-10"
        >
          Daftar
        </Button>
      </div>

      {/* Login Link */}
      <p className="text-center text-sm md:text-lg lg:text-sm text-text-200">
        Sudah punya akun?{" "}
        <a href="/auth" className="text-text-200 font-semibold hover:text-text-50 transition-colors underline">
          Masuk
        </a>
      </p>
    </form>
  )
}
