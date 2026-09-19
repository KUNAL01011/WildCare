"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "../hooks/useAuth";

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Wraps dashboard routes. If /me returns 401 (no cookie / expired token),
 * redirects to /login. The middleware handles this too, but this adds a
 * client-side safety net for when the access token expires mid-session.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const { isError, error } = useCurrentUser();

  useEffect(() => {
    if (!isError) return;
    // 401 means the cookie is gone or expired — send to login
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status === 401) {
      router.replace("/login");
    }
  }, [isError, error, router]);

  return <>{children}</>;
}