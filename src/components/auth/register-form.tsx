"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface RegisterFormProps {
  onStepChange?: (step: number) => void;
}

export default function RegisterForm({ onStepChange }: RegisterFormProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  })

  // Show/Hide password toggles
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleStepChange = (newStep: number) => {
    setStep(newStep)
    if (onStepChange) {
      onStepChange(newStep)
    }
  }

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    // Validation for Step 1
    if (!formData.email) newErrors.email = "Email wajib diisi"
    if (!formData.password) newErrors.password = "Password wajib diisi"
    if (formData.password.length < 8) newErrors.password = "Password minimal 8 karakter"
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password tidak cocok"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Clear errors and proceed
    setErrors({})
    handleStepChange(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    // Validation for Step 2
    if (!formData.firstName) newErrors.firstName = "Nama depan wajib diisi"
    if (!formData.lastName) newErrors.lastName = "Nama belakang wajib diisi"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const supabase = createClient()

      // Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          }
        }
      })

      if (authError) {
        setErrors({ email: authError.message })
        setIsLoading(false)
        return
      }

      if (authData.user) {
        // Success
        window.location.href = `/auth/verify-email?email=${encodeURIComponent(formData.email)}`
      }
    } catch (err) {
      console.error('Registration error:', err)
      setErrors({ form: 'Terjadi kesalahan saat registrasi.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={step === 1 ? handleNextStep : handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">

      {/* STEP 1: Email & Password */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
          {/* Email Field */}
          <div className="flex flex-col gap-3">
            <label htmlFor="email" className="text-sm text-text-200">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              aria-label="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-12 px-4 bg-glass-bg border-glass-border text-text-50 text-md md:text-xl lg:text-sm font-body font-semibold placeholder:text-input-placeholder-400 placeholder:opacity-0 placeholder-shown:placeholder:opacity-100 focus:placeholder:opacity-0 disabled:opacity-100 disabled:cursor-not-allowed selection:bg-brand-500/20 selection:text-text-900 rounded-md backdrop-blur-md border focus:bg-input-focus-bg focus:text-text-900 transition-all duration-200"
            />
            {errors.email && <p className="text-sm md:text-xl lg:text-sm text-text-error-500 px-4">{errors.email}</p>}
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-3">
            <label htmlFor="password" className="text-sm text-text-200">
              Password
            </label>
            <div className="relative group">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                aria-label="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-12 px-4 pr-12 bg-glass-bg border-glass-border text-text-50 text-md md:text-xl lg:text-sm font-body font-semibold placeholder:text-input-placeholder-400 placeholder:opacity-0 placeholder-shown:placeholder:opacity-100 focus:placeholder:opacity-0 disabled:opacity-100 disabled:cursor-not-allowed selection:bg-brand-500/20 selection:text-text-900 rounded-md backdrop-blur-md border focus:bg-input-focus-bg focus:text-text-900 transition-all duration-200"
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
            {errors.password && <p className="text-sm md:text-xl lg:text-sm text-text-error-500 px-4">{errors.password}</p>}
          </div>

          {/* Confirm Password Field */}
          <div className="flex flex-col gap-3">
            <label htmlFor="confirmPassword" className="text-sm text-text-200">
              Konfirmasi Password
            </label>
            <div className="relative group">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Konfirmasi Password"
                aria-label="Konfirmasi Password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="h-12 px-4 pr-12 bg-glass-bg border-glass-border text-text-50 text-md md:text-xl lg:text-sm font-body font-semibold placeholder:text-input-placeholder-400 placeholder:opacity-0 placeholder-shown:placeholder:opacity-100 focus:placeholder:opacity-0 disabled:opacity-100 disabled:cursor-not-allowed selection:bg-brand-500/20 selection:text-text-900 rounded-md backdrop-blur-md border focus:bg-input-focus-bg focus:text-text-900 transition-all duration-200"
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
            {errors.confirmPassword && <p className="text-sm md:text-xl lg:text-sm text-text-error-500 px-4">{errors.confirmPassword}</p>}
          </div>
        </div>
      )}

      {/* STEP 2: Name */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
          {/* First Name Field */}
          <div className="flex flex-col gap-3">
            <label htmlFor="firstName" className="text-sm text-text-200">
              Nama depan
            </label>
            <Input
              id="firstName"
              type="text"
              placeholder="Nama depan"
              aria-label="Nama depan"
              autoFocus
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="h-12 px-4 bg-glass-bg border-glass-border text-text-50 text-md md:text-xl lg:text-sm font-body font-semibold placeholder:text-input-placeholder-400 placeholder:opacity-0 placeholder-shown:placeholder:opacity-100 focus:placeholder:opacity-0 disabled:opacity-100 disabled:cursor-not-allowed selection:bg-brand-500/20 selection:text-text-900 rounded-xl backdrop-blur-md border focus:bg-input-focus-bg focus:text-text-900 transition-all duration-200"
            />
            {errors.firstName && <p className="text-sm md:text-xl lg:text-sm text-text-error-500 px-4">{errors.firstName}</p>}
          </div>

          {/* Last Name Field */}
          <div className="flex flex-col gap-3">
            <label htmlFor="lastName" className="text-sm text-text-200">
              Nama belakang
            </label>
            <Input
              id="lastName"
              type="text"
              placeholder="Nama belakang"
              aria-label="Nama belakang"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="h-12 px-4 bg-glass-bg border-glass-border text-text-50 text-md md:text-xl lg:text-sm font-body font-semibold placeholder:text-input-placeholder-400 placeholder:opacity-0 placeholder-shown:placeholder:opacity-100 focus:placeholder:opacity-0 disabled:opacity-100 disabled:cursor-not-allowed selection:bg-brand-500/20 selection:text-text-900 rounded-xl backdrop-blur-md border focus:bg-input-focus-bg focus:text-text-900 transition-all duration-200"
            />
            {errors.lastName && <p className="text-sm md:text-xl lg:text-sm text-text-error-500 px-4">{errors.lastName}</p>}
          </div>

          {/* Back Button for UX */}
          <button
            type="button"
            onClick={() => handleStepChange(1)}
            className="text-text-200 text-sm hover:text-text-50 transition-colors flex items-center gap-2"
          >
            ← Kembali ke email
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full font-button font-medium text-md md:text-xl lg:text-sm bg-button-primary text-text-50 hover:bg-button-primary-hover active:bg-button-primary-active tracking-wide transition-all duration-500 ease-out h-12 rounded-full hover:scale-105 disabled:bg-button-disabled disabled:text-text-100 disabled:opacity-100 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-text-50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memproses...
            </span>
          ) : (
            step === 1 ? "Selanjutnya" : "Daftar"
          )}
        </Button>
      </div>

      {/* Login Link - Only on Step 1 to avoid clutter on Step 2? Or keep it? Keeping it creates consistency. */}
      {step === 1 && (
        <p className="text-center pb-4 text-sm md:text-lg lg:text-sm text-text-200">
          Sudah punya akun?{" "}
          <a href="/auth" className="text-text-200 font-semibold hover:text-text-50 transition-colors underline">
            Masuk
          </a>
        </p>
      )}
    </form>
  )
}
