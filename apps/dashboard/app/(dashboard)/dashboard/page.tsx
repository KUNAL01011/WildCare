"use client";

import type { Metadata } from "next";
import { useLogout } from "@/features/auth/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const logoutMutation = useLogout();

  async function handleLogout() {
    await logoutMutation.mutateAsync();
    router.replace("/login");
  }

  return (
    <main className="min-h-screen p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Welcome to TransitOps. You&apos;re authenticated.
          </p>
        </div>

        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="rounded-lg bg-destructive px-4 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {logoutMutation.isPending ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </main>
  );
}
