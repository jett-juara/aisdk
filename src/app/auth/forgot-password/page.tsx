import ForgotPasswordForm from "@/components/auth/forgot-password-form";
import { HeaderLogo } from "@/components/layout/header/logo";
import { AuthGridBackground } from "@/components/auth/auth-grid-background";

export default function ForgotPasswordPage() {
  const title = "Lupa Password?";
  const subtitle = "Kirim email terdaftar untuk menerima tautan reset.";

  return (
    <section className="bg-background-800 md:bg-background-800 lg:bg-background-900 min-h-screen">
      {/* Mobile & Tablet Layout - Tanpa Card */}
      <div className="lg:hidden min-h-screen flex flex-col px-0 py-0">
        {/* Logo untuk mobile & tablet - Standardized with Home Header */}
        <div className="h-20 flex items-center px-4">
          <HeaderLogo size="sm" className="md:hidden" />
          <HeaderLogo size="md" className="hidden md:flex" />
        </div>

        {/* Header + Form dalam satu container untuk mobile & tablet */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="max-w-full mx-auto w-full space-y-8">
            {/* Header menggunakan auth-shell pattern */}
            {(title || subtitle) && (
              <div className="text-left mx-auto w-[90%] md:w-[60%]">
                {title && (
                  <h1 className="font-headingSecondary font-bold text-3xl md:text-5xl tracking-tighter text-premium-gradient leading-[1.1] pb-[0.1em]">{title}</h1>
                )}
                {subtitle && (
                  <p className="mt-0 font-subheading text-lg md:text-2xl md:mt-2 text-text-50">{subtitle}</p>
                )}
              </div>
            )}

            {/* Form */}
            <ForgotPasswordForm />
          </div>
        </div>
      </div>

      {/* Desktop Layout - Card Design */}
      <div className="hidden lg:flex min-h-screen items-center justify-center px-4 relative overflow-hidden">
        <AuthGridBackground />
        <div className="w-full max-w-md glass-card-premium lg:p-8 z-10">
          {/* Logo */}
          <div className="h-8 mb-4 flex items-center justify-center">
            <HeaderLogo size="sm" />
          </div>

          {/* Header menggunakan auth-shell pattern */}
          {(title || subtitle) && (
            <div className="mb-6 text-center">
              {title && (
                <h1 className="font-headingSecondary font-bold lg:text-3xl tracking-tighter text-premium-gradient leading-[1.1] pb-[0.1em]">{title}</h1>
              )}
              {subtitle && (
                <p className="mt-0 font-subheading lg:text-md lg:mt-0 text-text-50">{subtitle}</p>
              )}
            </div>
          )}

          {/* Form */}
          <ForgotPasswordForm />
        </div>
      </div>
    </section>
  );
}
