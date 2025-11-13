import { AuthShell } from "@/components/auth/auth-shell";
import RegisterForm from "@/components/auth/register-form";
import TestimonialRegister from "@/components/auth/testimonial-register";

export default function RegisterPage() {
  return (
    <AuthShell title="Register" subtitle=" Mari berkolaborasi" left={<RegisterForm />} right={<TestimonialRegister />} />
  );
}
