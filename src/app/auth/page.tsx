import LoginForm from "@/components/auth/login-form";
import TestimonialLogin from "@/components/auth/testimonial-login";
import { AuthShell } from "@/components/auth/auth-shell";

export default function AuthPage() {
  return (
    <AuthShell
      title="Selamat Datang"
      subtitle="Silakan masuk ke akun"
      left={<LoginForm />}
      right={<TestimonialLogin />}
    />
  );
}
