import RegisterForm from "@/components/auth/register-form"
import TestimonialRegister from "@/components/auth/testimonial-register"
import { Button } from "@/components/ui/button"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-auth-bg-form flex">
      {/* Left Section - Form */}
      <div
        className="w-full md:w-2/5 flex flex-col justify-between px-8 md:px-16 py-12 md:py-16 bg-auth-bg-form"
        style={{
          paddingLeft: "64px",
          paddingRight: "64px",
          paddingTop: "32px",
          paddingBottom: "32px",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2" style={{ gap: "8px" }}>
          <div
            className="w-10 h-10 bg-auth-button-brand rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ borderRadius: "12px" }}
          >
            <svg className="w-6 h-6 text-auth-text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M11.3 1.046A1 1 0 0010 2v5H4a1 1 0 00-.82 1.573l7 10A1 1 0 0011 18v-5h6a1 1 0 00.82-1.573l-7-10a1 1 0 00-.68-.381z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span className="text-auth-text-primary text-2xl font-brand font-bold" style={{ fontSize: "22px" }}>
            Jett
          </span>
        </div>

        {/* Form Section */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="mb-8" style={{ marginBottom: "32px" }}>
            <h1
              className="text-5xl font-bold text-auth-text-primary mb-3 font-heading"
              style={{ fontSize: "56px", lineHeight: "1.2", marginBottom: "16px" }}
            >
              Buat Akun
            </h1>
            <p
              className="text-auth-text-muted text-base font-body"
              style={{ fontSize: "16px", color: "var(--color-auth-text-muted)" }}
            >
              Daftar untuk memulai perjalanan Anda
            </p>
          </div>

          <RegisterForm />
        </div>

        </div>

      {/* Right Section - Testimonial */}
      <div
        className="hidden md:flex w-3/5 flex-col px-12 py-16 bg-auth-bg-testimonial"
        style={{ paddingLeft: "48px", paddingRight: "48px", paddingTop: "48px" }}
      >
        <div className="flex justify-end mb-12" style={{ marginBottom: "48px" }}>
          <Button
            variant="outline"
            className="border-auth-border text-auth-text-secondary hover:text-auth-text-primary hover:border-auth-button-brand hover:bg-auth-button-secondary bg-transparent gap-2 flex items-center font-body"
            style={{ gap: "8px" }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm2 1a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V7zm8-1a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V7zM5 13a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2zm8-1a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2z" />
            </svg>
            Company Profile
          </Button>
        </div>

        {/* Testimonial content centered */}
        <div className="flex-1 flex items-center justify-center">
          <TestimonialRegister />
        </div>
      </div>
    </div>
  )
}
