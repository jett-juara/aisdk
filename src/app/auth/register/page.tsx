import { AuthShell } from "@/components/auth/auth-shell";
import RegisterForm from "@/components/auth/register-form";
import TestimonialRegister from "@/components/auth/testimonial-register";

export default function RegisterPage() {
  return (
    <AuthShell subtitle="Daftar untuk kolaborasi" left={<RegisterForm />} right={<TestimonialRegister />} />
  );
}
