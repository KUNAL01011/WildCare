// ── Backend response shapes ────────────────────────────────────────────────
// These match the actual JSON your Express backend returns.

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

// /api/auth/register
export interface RegisterResponseData {
  verificationToken: string;
}

// /api/auth/verify-email
export interface VerifyEmailResponseData {
  message: string;
}

// /api/auth/login
export interface LoginResponseData {
  user: User;
}

// /api/auth/me
export interface MeResponseData {
  user: User;
}

// /api/auth/refresh  /api/auth/logout  /api/auth/resend-otp
export interface MessageResponseData {
  message: string;
}

// ── Request shapes ─────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface VerifyEmailRequest {
  otp: string;
}
