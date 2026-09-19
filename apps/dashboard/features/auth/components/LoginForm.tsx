"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";

import { useLogin } from "../hooks/useAuth";
import { loginSchema, type LoginFormData } from "../schemas/auth.schemas";
import { FormField, ErrorBanner, SubmitButton } from "./FormField";

function extractErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const msg = error.response?.data?.error?.message;
    if (typeof msg === "string") return msg;
    if (error.response?.status === 401) return "Invalid email or password";
    if (error.response?.status === 403) return "Please verify your email first";
    if (error.response?.status === 429)
      return "Too many attempts. Try again later.";
  }
  return "Unable to sign in. Please try again.";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    try {
      await loginMutation.mutateAsync(data);
      const next = searchParams.get("next");
      router.replace(next && next.startsWith("/") ? next : "/dashboard");
    } catch {
      // Error displayed via loginMutation.error below
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <ErrorBanner
        message={
          loginMutation.isError
            ? extractErrorMessage(loginMutation.error)
            : null
        }
      />

      <FormField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        disabled={loginMutation.isPending}
        {...register("email")}
      />

      <FormField
        id="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        error={errors.password?.message}
        disabled={loginMutation.isPending}
        {...register("password")}
      />

      <SubmitButton
        loading={loginMutation.isPending}
        label="Sign in"
        loadingLabel="Signing in…"
      />

      <p className="text-center text-sm text-[var(--muted-foreground)]">
        No account?{" "}
        <Link
          href="/register"
          className="text-[var(--primary)] hover:underline"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}
