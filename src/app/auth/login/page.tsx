import LoginForm from "@/components/auth/login-form";
import TestimonialLogin from "@/components/auth/testimonial-login";
import { AuthShell } from "@/components/auth/auth-shell";

export default function LoginPage() {
  return (
    <AuthShell
      title="Masuk Akun"
      subtitle="Login untuk mengakses dashboard"
      left={<LoginForm />}
      right={<TestimonialLogin />}
    />
  );
}
