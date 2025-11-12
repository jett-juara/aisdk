import ForgotPasswordForm from "@/components/auth/forgot-password-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Lupa Password?"
      subtitle="Masukkan email lo. Kami kirim tautan reset."
      left={<ForgotPasswordForm />}
      right={null}
    />
  );
}
