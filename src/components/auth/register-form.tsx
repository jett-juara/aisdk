"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

interface RegisterFormProps {
  onStepChange?: (step: number) => void;
}

export default function RegisterForm({ onStepChange }: RegisterFormProps) {
  const [step, setStep] = useState(1)
  const [stepOneData, setStepOneData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [stepTwoData, setStepTwoData] = useState({
    firstName: "",
    lastName: ""
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleStepOne = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!stepOneData.email) newErrors.email = "Email wajib diisi"
    if (!stepOneData.password) newErrors.password = "Password wajib diisi"
    if (stepOneData.password.length < 8) newErrors.password = "Password minimal 8 karakter"
    if (stepOneData.password !== stepOneData.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password tidak cocok"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setStep(2)
    onStepChange?.(2)
  }

  const handleStepTwo = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!stepTwoData.firstName) newErrors.firstName = "Nama depan wajib diisi"
    if (!stepTwoData.lastName) newErrors.lastName = "Nama belakang wajib diisi"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      // 1. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: stepOneData.email,
        password: stepOneData.password,
        options: {
          data: {
            first_name: stepTwoData.firstName,
            last_name: stepTwoData.lastName,
          }
        }
      })

      if (authError) {
        setErrors({ email: authError.message })
        setIsLoading(false)
        return
      }

      if (authData.user) {
        // User created successfully. Trigger will handle profile creation.
        // Success
        window.location.href = `/auth/verify-email?email=${encodeURIComponent(stepOneData.email)}`
      }
    } catch (err) {
      console.error('Registration error:', err)
      setErrors({ form: 'Terjadi kesalahan saat registrasi.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    setStep(1)
    onStepChange?.(1)
  }

  const isStepOneValid =
    stepOneData.email.length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stepOneData.email) &&
    stepOneData.password.length >= 8 &&
    stepOneData.password === stepOneData.confirmPassword;

  const isStepTwoValid =
    stepTwoData.firstName.length >= 2 &&
    stepTwoData.lastName.length >= 2;

  if (step === 1) {
    return (
      <form onSubmit={handleStepOne} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
        {/* Email Field */}
        <div className="flex flex-col gap-3">
          <Input
            id="email"
            type="email"
            placeholder="Email"
            aria-label="Email"
            value={stepOneData.email}
            onChange={(e) => setStepOneData({ ...stepOneData, email: e.target.value })}
            className="h-12 px-4 bg-glass-bg border-glass-border text-text-50 text-md md:text-xl lg:text-sm font-body font-semibold placeholder:text-input-placeholder-400 placeholder:opacity-0 placeholder-shown:placeholder:opacity-100 focus:placeholder:opacity-0 disabled:opacity-100 disabled:cursor-not-allowed selection:bg-brand-500/20 selection:text-text-900 rounded-xl backdrop-blur-md border focus:bg-input-focus-bg focus:text-text-900 transition-all duration-200"
          />
          {errors.email && <p className="text-sm md:text-xl lg:text-sm text-text-error-500 px-4">{errors.email}</p>}
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-3">
          <div className="relative group">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              aria-label="Password"
              value={stepOneData.password}
              onChange={(e) => setStepOneData({ ...stepOneData, password: e.target.value })}
              className="h-12 px-4 pr-12 bg-glass-bg border-glass-border text-text-50 text-md md:text-xl lg:text-sm font-body font-semibold placeholder:text-input-placeholder-400 placeholder:opacity-0 placeholder-shown:placeholder:opacity-100 focus:placeholder:opacity-0 disabled:opacity-100 disabled:cursor-not-allowed selection:bg-brand-500/20 selection:text-text-900 rounded-xl backdrop-blur-md border focus:bg-input-focus-bg focus:text-text-900 transition-all duration-200"
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
          <div className="relative group">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Konfirmasi Password"
              aria-label="Konfirmasi Password"
              value={stepOneData.confirmPassword}
              onChange={(e) => setStepOneData({ ...stepOneData, confirmPassword: e.target.value })}
              className="h-12 px-4 pr-12 bg-glass-bg border-glass-border text-text-50 text-md md:text-xl lg:text-sm font-body font-semibold placeholder:text-input-placeholder-400 placeholder:opacity-0 placeholder-shown:placeholder:opacity-100 focus:placeholder:opacity-0 disabled:opacity-100 disabled:cursor-not-allowed selection:bg-brand-500/20 selection:text-text-900 rounded-xl backdrop-blur-md border focus:bg-input-focus-bg focus:text-text-900 transition-all duration-200"
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

        {/* Next Button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={!isStepOneValid}
            className="w-full font-button font-medium text-md md:text-xl lg:text-sm bg-button-primary text-text-50 hover:bg-button-primary-hover active:bg-button-primary-active tracking-wide transition-all duration-500 ease-out h-12 rounded-full hover:scale-105 disabled:bg-button-disabled disabled:text-text-400 disabled:opacity-100 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Selanjutnya
          </Button>
        </div>

        {/* Login Link */}
        <p className="text-center pb-4 text-sm md:text-lg lg:text-sm text-text-200">
          Sudah punya akun?{" "}
          <a href="/auth" className="text-text-200 font-semibold hover:text-text-50 transition-colors underline">
            Masuk
          </a>
        </p>
      </form>
    )
  }

  return (
    <form onSubmit={handleStepTwo} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* First Name Field */}
      <div className="flex flex-col gap-3">
        <Input
          id="firstName"
          type="text"
          placeholder="Nama depan"
          aria-label="Nama depan"
          value={stepTwoData.firstName}
          onChange={(e) => setStepTwoData({ ...stepTwoData, firstName: e.target.value })}
          className="h-12 px-4 bg-glass-bg border-glass-border text-text-50 text-md md:text-xl lg:text-sm font-body font-semibold placeholder:text-input-placeholder-400 placeholder:opacity-0 placeholder-shown:placeholder:opacity-100 focus:placeholder:opacity-0 disabled:opacity-100 disabled:cursor-not-allowed selection:bg-brand-500/20 selection:text-text-900 rounded-xl backdrop-blur-md border focus:bg-input-focus-bg focus:text-text-900 transition-all duration-200"
        />
        {errors.firstName && <p className="text-sm md:text-xl lg:text-sm text-text-error-500 px-4">{errors.firstName}</p>}
      </div>

      {/* Last Name Field */}
      <div className="flex flex-col gap-3">
        <Input
          id="lastName"
          type="text"
          placeholder="Nama belakang"
          aria-label="Nama belakang"
          value={stepTwoData.lastName}
          onChange={(e) => setStepTwoData({ ...stepTwoData, lastName: e.target.value })}
          className="h-12 px-4 bg-glass-bg border-glass-border text-text-50 text-md md:text-xl lg:text-sm font-body font-semibold placeholder:text-input-placeholder-400 placeholder:opacity-0 placeholder-shown:placeholder:opacity-100 focus:placeholder:opacity-0 disabled:opacity-100 disabled:cursor-not-allowed selection:bg-brand-500/20 selection:text-text-900 rounded-xl backdrop-blur-md border focus:bg-input-focus-bg focus:text-text-900 transition-all duration-200"
        />
        {errors.lastName && <p className="text-sm md:text-xl lg:text-sm text-text-error-500 px-4">{errors.lastName}</p>}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4">
        {/* Register Button */}
        <Button
          type="submit"
          disabled={!isStepTwoValid || isLoading}
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
          ) : "Daftar"}
        </Button>

        {/* Back Button */}
        <Button
          type="button"
          onClick={handleBack}
          variant="outline"
          className="w-full font-button font-medium text-md md:text-xl lg:text-sm text-text-200 hover:text-text-50 border-glass-border hover:bg-glass-bg rounded-full hover:scale-105 h-12 transition-all duration-300"
        >
          Kembali
        </Button>
      </div>

      {/* Login Link */}
      <p className="text-center pb-4 text-sm md:text-lg lg:text-sm text-text-200">
        Sudah punya akun?{" "}
        <a href="/auth" className="text-text-200 font-semibold hover:text-text-50 transition-colors underline">
          Masuk
        </a>
      </p>
    </form>
  )
}
