import ForgotPasswordForm from "@/components/auth/forgot-password-form";
import { HeaderLogo } from "@/components/layout/header/logo";

export default function ForgotPasswordPage() {
  return (
    <section className="bg-background-800 min-h-screen">
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl border border-input-border-800 bg-background-900 p-6 md:p-8 shadow-xs">
          {/* Logo (shared with site header) */}
          <div className="mb-6 h-10 flex items-center">
            <HeaderLogo />
          </div>

          {/* Header */}
          <div className="mb-6">
            <h1 className="font-heading font-bold text-2xl text-text-200">Lupa Password?</h1>
            <p className="mt-2 font-body text-xl text-text-50">Masukkan email Anda, dan kami akan mengirimkan kode untuk mereset password</p>
          </div>

          {/* Form Section */}
          <ForgotPasswordForm />
        </div>
      </div>
    </section>
  );
}
