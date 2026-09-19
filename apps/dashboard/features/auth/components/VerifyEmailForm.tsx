"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";

import { useVerifyEmail, useResendOtp } from "../hooks/useAuth";
import {
  verifyEmailSchema,
  type VerifyEmailFormData,
} from "../schemas/auth.schemas";
import { ErrorBanner, SubmitButton } from "./FormField";

function extractErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const code = error.response?.data?.error?.code;
    const msg = error.response?.data?.error?.message;
    if (code === "OTP_EXPIRED") return "Code expired. Request a new one.";
    if (code === "INVALID_OTP") return "Invalid code. Check your email and try again.";
    if (typeof msg === "string") return msg;
  }
  return "Verification failed. Please try again.";
}

// ── OTP Input ─────────────────────────────────────────────────────────────
// Single-character boxes that auto-advance like a proper OTP UI.

function OtpInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const boxes = 6;
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const chars = value.split("");

  function handleKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = chars.slice();
      if (next[idx]) {
        next[idx] = "";
      } else if (idx > 0) {
        next[idx - 1] = "";
        refs.current[idx - 1]?.focus();
      }
      onChange(next.join(""));
    }
  }

  function handleChange(idx: number, e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) return;
    const next = chars.slice();
    // Handle paste: fill from current position
    const filled = raw.slice(0, boxes - idx);
    for (let i = 0; i < filled.length; i++) {
      next[idx + i] = filled[i];
    }
    onChange(next.join("").slice(0, boxes));
    const nextFocus = Math.min(idx + filled.length, boxes - 1);
    refs.current[nextFocus]?.focus();
  }

  function handleFocus(idx: number) {
    refs.current[idx]?.select();
  }

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: boxes }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => { refs.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={chars[idx] ?? ""}
          disabled={disabled}
          onChange={(e) => handleChange(idx, e)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onFocus={() => handleFocus(idx)}
          className="h-12 w-12 rounded-lg border border-[var(--border)] bg-[var(--input)] text-center text-lg font-semibold text-[var(--foreground)] outline-none transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 disabled:opacity-50"
          aria-label={`Digit ${idx + 1}`}
        />
      ))}
    </div>
  );
}

// ── Verify Email Form ─────────────────────────────────────────────────────

export function VerifyEmailForm() {
  const router = useRouter();
  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendOtp();

  const [otpValue, setOtpValue] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState(false);

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { otp: "" },
  });

  // Sync OTP input to RHF
  useEffect(() => {
    setValue("otp", otpValue, { shouldValidate: otpValue.length === 6 });
  }, [otpValue, setValue]);

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  function getToken(): string | null {
    return sessionStorage.getItem("verificationToken");
  }

  async function onSubmit(data: VerifyEmailFormData) {
    const token = getToken();
    if (!token) {
      router.replace("/register");
      return;
    }
    try {
      await verifyMutation.mutateAsync({ data, verificationToken: token });
      sessionStorage.removeItem("verificationToken");
      router.replace("/login?verified=1");
    } catch {
      // Error shown via verifyMutation.error
    }
  }

  async function handleResend() {
    const token = getToken();
    if (!token || resendCooldown > 0) return;
    try {
      await resendMutation.mutateAsync(token);
      setResendSuccess(true);
      setResendCooldown(60);
      setTimeout(() => setResendSuccess(false), 4000);
    } catch {
      // Error shown via resendMutation.error
    }
  }

  const isPending = verifyMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <ErrorBanner
        message={
          verifyMutation.isError
            ? extractErrorMessage(verifyMutation.error)
            : resendMutation.isError
            ? "Couldn't resend code. Please wait and try again."
            : null
        }
      />

      {resendSuccess && (
        <div className="rounded-lg border border-[var(--success)]/20 bg-[var(--success)]/10 px-4 py-3 text-sm text-[var(--success)]">
          New code sent. Check your inbox.
        </div>
      )}

      <OtpInput
        value={otpValue}
        onChange={setOtpValue}
        disabled={isPending}
      />

      {errors.otp && (
        <p role="alert" className="text-center text-xs text-[var(--destructive)]">
          {errors.otp.message}
        </p>
      )}

      <SubmitButton
        loading={isPending}
        label="Verify email"
        loadingLabel="Verifying…"
      />

      <div className="flex items-center justify-center gap-1 text-sm text-[var(--muted-foreground)]">
        <span>Didn&apos;t receive it?</span>
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0 || resendMutation.isPending}
          className="text-[var(--primary)] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          {resendCooldown > 0
            ? `Resend in ${resendCooldown}s`
            : resendMutation.isPending
            ? "Sending…"
            : "Resend code"}
        </button>
      </div>
    </form>
  );
}