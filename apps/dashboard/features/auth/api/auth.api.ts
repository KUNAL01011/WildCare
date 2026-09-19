import { api } from "@/lib/api/api";
import type {
  ApiSuccess,
  LoginRequest,
  LoginResponseData,
  RegisterRequest,
  RegisterResponseData,
  VerifyEmailRequest,
  VerifyEmailResponseData,
  MeResponseData,
  MessageResponseData,
} from "../types/auth.types";

// ── Register ──────────────────────────────────────────────────────────────

export async function register(
  data: RegisterRequest
): Promise<ApiSuccess<RegisterResponseData>> {
  const res = await api.post<ApiSuccess<RegisterResponseData>>(
    "/api/auth/register",
    data
  );
  return res.data;
}

// ── Verify Email ──────────────────────────────────────────────────────────

export async function verifyEmail(
  data: VerifyEmailRequest,
  verificationToken: string
): Promise<ApiSuccess<VerifyEmailResponseData>> {
  const res = await api.post<ApiSuccess<VerifyEmailResponseData>>(
    "/api/auth/verify-email",
    data,
    { headers: { Authorization: `Bearer ${verificationToken}` } }
  );
  return res.data;
}

// ── Resend OTP ────────────────────────────────────────────────────────────

export async function resendOtp(
  verificationToken: string
): Promise<ApiSuccess<MessageResponseData>> {
  const res = await api.post<ApiSuccess<MessageResponseData>>(
    "/api/auth/resend-otp",
    {},
    { headers: { Authorization: `Bearer ${verificationToken}` } }
  );
  return res.data;
}

// ── Login ─────────────────────────────────────────────────────────────────

export async function login(
  data: LoginRequest
): Promise<ApiSuccess<LoginResponseData>> {
  const res = await api.post<ApiSuccess<LoginResponseData>>(
    "/api/auth/login",
    data
  );
  return res.data;
}

// ── Refresh ───────────────────────────────────────────────────────────────

export async function refreshToken(): Promise<ApiSuccess<MessageResponseData>> {
  const res =
    await api.post<ApiSuccess<MessageResponseData>>("/api/auth/refresh");
  return res.data;
}

// ── Logout ────────────────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  await api.post("/api/auth/logout");
}

// ── Me ────────────────────────────────────────────────────────────────────

export async function getCurrentUser(): Promise<ApiSuccess<MeResponseData>> {
  const res = await api.get<ApiSuccess<MeResponseData>>("/api/auth/me");
  return res.data;
}
