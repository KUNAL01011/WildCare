"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";

import { useRegister } from "../hooks/useAuth";
import {
  registerSchema,
  type RegisterFormData,
} from "../schemas/auth.schemas";
import { FormField, ErrorBanner, SubmitButton } from "./FormField";

function extractErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const msg = error.response?.data?.error?.message;
    if (typeof msg === "string") return msg;
    if (error.response?.status === 409) return "This email is already registered";
    if (error.response?.status === 429) return "Too many attempts. Try again later.";
  }
  return "Registration failed. Please try again.";
}

export function RegisterForm() {
  const router = useRouter();
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormData) {
    try {
      const result = await registerMutation.mutateAsync(data);
      // Store the short-lived JWT needed for /verify-email and /resend-otp
      sessionStorage.setItem(
        "verificationToken",
        result.data.verificationToken
      );
      router.push("/verify-email");
    } catch {
      // Error displayed via registerMutation.error
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <ErrorBanner
        message={
          registerMutation.isError
            ? extractErrorMessage(registerMutation.error)
            : null
        }
      />

      <FormField
        id="name"
        label="Full name"
        type="text"
        autoComplete="name"
        placeholder="Kunal Kumar"
        error={errors.name?.message}
        disabled={registerMutation.isPending}
        {...register("name")}
      />

      <FormField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        disabled={registerMutation.isPending}
        {...register("email")}
      />

      <FormField
        id="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        placeholder="Min. 8 characters"
        error={errors.password?.message}
        disabled={registerMutation.isPending}
        {...register("password")}
      />

      <SubmitButton
        loading={registerMutation.isPending}
        label="Create account"
        loadingLabel="Creating account…"
      />

      <p className="text-center text-sm text-[var(--muted-foreground)]">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--primary)] hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}