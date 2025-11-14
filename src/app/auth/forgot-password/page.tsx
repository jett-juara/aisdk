import ForgotPasswordForm from "@/components/auth/forgot-password-form";
import { HeaderLogo } from "@/components/layout/header/logo";

export default function ForgotPasswordPage() {
  const title = "Lupa Password?";
  const subtitle = "Kirim email terdaftar untuk menerima tautan reset.";

  return (
    <section className="bg-background-800 md:bg-background-800 lg:bg-background-900 min-h-screen">
      {/* Mobile & Tablet Layout - Tanpa Card */}
      <div className="lg:hidden min-h-screen flex flex-col px-4 py-6 px-6 md:px-8">
        {/* Logo untuk mobile & tablet */}
        <div className="h-10 flex items-center">
           <HeaderLogo size="lg" />
        </div>

        {/* Header + Form dalam satu container untuk mobile & tablet */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="max-w-full mx-auto w-full space-y-8">
            {/* Header menggunakan auth-shell pattern */}
            {(title || subtitle) && (
              <div className="text-left mx-auto w-[80%] md:w-[60%]">
                {title && (
                  <h1 className="font-heading font-semibold text-3xl md:text-5xl tracking-tighter text-text-200">{title}</h1>
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
      <div className="hidden lg:flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-lg border border-input-border-800 bg-background-800 lg:p-6">
          {/* Logo */}
          <div className="h-8 mb-4 flex items-center">
            <HeaderLogo size="sm" />
          </div>

          {/* Header menggunakan auth-shell pattern */}
          {(title || subtitle) && (
            <div className="mb-6">
              {title && (
                <h1 className="font-heading font-semibold lg:text-3xl tracking-tighter text-text-200">{title}</h1>
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
