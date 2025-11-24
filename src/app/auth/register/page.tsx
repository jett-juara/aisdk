"use client";

import RegisterForm from "@/components/auth/register-form";
import TestimonialRegister from "@/components/auth/testimonial-register";
import { AuthShell } from "@/components/auth/auth-shell";
import { useState } from "react";

export default function RegisterPage() {
  const [step, setStep] = useState(1);

  return (
    <AuthShell
      title="Mari Berkolaborasi"
      subtitle="Buat akun baru Anda"
      stepIndicator={step === 1 ? "Tahap 1/2" : "Tahap 2/2"}
      left={<RegisterForm onStepChange={setStep} />}
      right={<TestimonialRegister />}
    />
  );
}
