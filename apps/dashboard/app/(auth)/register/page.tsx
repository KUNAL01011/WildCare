import type { Metadata } from "next";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create your account"
      subtitle="Start managing transit operations today"
    >
      <RegisterForm />
    </AuthCard>
  );
}