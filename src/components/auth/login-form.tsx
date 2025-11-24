"use client"

import type React from "react"
import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorEmail, setErrorEmail] = useState<string | null>(null)
  const [errorPassword, setErrorPassword] = useState<string | null>(null)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  // Check for verified query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("verified") === "true") {
      toast({
        title: "Email Terverifikasi",
        description: "Email Anda berhasil diverifikasi. Silakan login.",
        variant: "success",
      })
      // Clean up URL
      router.replace("/auth")
    }
  }, [router, toast])

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorEmail(null)
    setErrorPassword(null)
    setGeneralError(null)

    const emailValid = /.+@.+\..+/.test(email)
    if (!emailValid) {
      setErrorEmail("Email tidak valid")
      return
    }
    if (password.length < 1) {
      setErrorPassword("Password wajib diisi")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        const message =
          (payload && typeof payload.error === "string" && payload.error.trim().length > 0
            ? payload.error.trim()
            : "Login gagal. Coba lagi!")

        setGeneralError(message)
        toast({
          title: "Login gagal",
          description: message,
          variant: "error",
        })
        setIsLoading(false) // Only set loading to false on error
        return
      }

      toast({
        title: "Login sukses",
        description: "Mengarahkan ke beranda...",
        variant: "success",
      })

      // Add small delay to ensure user sees success state
      setTimeout(() => {
        router.replace("/")
        router.refresh()
      }, 800)

      // Don't set loading to false here - let redirect handle it
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Terjadi kendala saat login. Coba beberapa saat lagi."
      setGeneralError(message)
      toast({
        title: "Login gagal",
        description: message,
        variant: "error",
      })
      setIsLoading(false) // Only set loading to false on error
    }
  }, [email, password, router, toast])

  const isValid = email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && password.length >= 8;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
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
          className="h-12 px-4 bg-glass-bg border-glass-border text-text-50 text-md md:text-xl lg:text-sm font-body font-semibold placeholder:text-input-placeholder-400 placeholder:opacity-0 placeholder-shown:placeholder:opacity-100 focus:placeholder:opacity-0 disabled:opacity-100 disabled:cursor-not-allowed selection:bg-brand-500/20 selection:text-text-900 rounded-xl backdrop-blur-md border focus:bg-input-focus-bg focus:text-text-900 transition-all duration-200"
        />
        {errorEmail && <p className="text-sm md:text-xl lg:text-sm text-text-error-500 px-4 ">{errorEmail}</p>}
      </div>

      {/* Password Field */}
      <div className="flex flex-col gap-3">
        <div className="relative group">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            aria-label="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
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
        {errorPassword && <p className="text-sm md:text-xl lg:text-sm text-text-error-500 px-4 mt-0">{errorPassword}</p>}
        <div className="flex justify-end items-center">
          <a
            href="/auth/forgot-password"
            className="text-text-200 transition-all duration-base text-sm md:text-lg lg:text-sm hover:text-text-50 focus-visible:text-brand-100 hover:underline hover:decoration-dotted hover:underline-offset-4 hover:decoration-1"
          >
            Lupa Password?
          </a>
        </div>
      </div>

      {/* Login Button */}
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
              Memverifikasi...
            </span>
          ) : (
            "Masuk"
          )}
        </Button>
      </div>

      {generalError ? (
        <p className="text-center text-lg text-auth-text-error">{generalError}</p>
      ) : null}

      {/* Register Link */}
      <p className="text-center text-sm md:text-lg lg:text-sm text-text-200">
        Tidak punya akun?{" "}
        <a
          href="/auth/register"
          className="text-text-200 font-semibold hover:text-text-50 transition-colors underline"
        >
          Register sekarang
        </a>
      </p>
    </form>
  )
}
