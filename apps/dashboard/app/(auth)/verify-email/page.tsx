import type { Metadata } from "next";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { VerifyEmailForm } from "@/features/auth/components/VerifyEmailForm";

export const metadata: Metadata = { title: "Verify email" };

export default function VerifyEmailPage() {
  return (
    <AuthCard
      title="Check your inbox"
      subtitle="We sent a 6-digit code to your email address"
    >
      <VerifyEmailForm />
    </AuthCard>
  );
}