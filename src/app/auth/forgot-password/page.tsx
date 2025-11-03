import Link from "next/link"
import ForgotPasswordForm from "@/components/auth/forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-auth-bg-form flex items-center justify-center">
      {/* Center Card - Form Only */}
      <div
        className="w-full max-w-md flex flex-col gap-8 px-8 py-12"
        style={{
          paddingLeft: "32px",
          paddingRight: "32px",
          paddingTop: "48px",
          paddingBottom: "48px",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2" style={{ gap: "8px" }}>
          <Link href="/" className="flex items-center gap-2">
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--color-auth-button-brand)" }}>
      <svg className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M11.3 1.046A1 1 0 0010 2v5H4a1 1 0 00-.82 1.573l7 10A1 1 0 0011 18v-5h6a1 1 0 00.82-1.573l-7-10a1 1 0 00-.68-.381z"
        />
      </svg>
    </div>
    <span className="font-brand text-xl font-bold uppercase text-auth-text-primary lg:text-2xl">
      JETT
    </span>
  </Link>
        </div>

        {/* Header */}
        <div>
          <h1
            className="text-5xl font-bold text-auth-text-primary mb-3 font-heading"
            style={{ fontSize: "40px", lineHeight: "1.2", marginBottom: "16px" }}
          >
            Lupa Password?
          </h1>
          <p
            className="text-auth-text-muted text-base font-body"
            style={{ fontSize: "16px", color: "var(--color-auth-text-muted)" }}
          >
            Masukkan email Anda, dan kami akan mengirimkan kode untuk mereset password
          </p>
        </div>

        {/* Form Section */}
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
