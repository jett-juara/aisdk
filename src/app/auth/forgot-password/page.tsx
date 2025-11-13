import ForgotPasswordForm from "@/components/auth/forgot-password-form";
import { HeaderLogo } from "@/components/layout/header/logo";

export default function ForgotPasswordPage() {
  return (
    <section className="bg-background-900 min-h-screen">
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-input-border-800 bg-background-800 p-6">
          {/* Logo */}
          <div className="mb-6 h-10 flex items-center">
            <HeaderLogo />
          </div>

          {/* Header */}
          <div className="mb-6">
            <h1 className="font-heading font-semibold text-xl tracking-tighter text-text-200">Lupa Password?</h1>
            <p className="font-subheading text-sm text-text-50">Masukkan email terdaftar untuk menerima tautan reset.</p>
          </div>

          {/* Form */}
          <ForgotPasswordForm />
        </div>
      </div>
    </section>
  );
}
