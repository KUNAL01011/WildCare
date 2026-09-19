import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "TransitOps" },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      {/* Subtle grid background */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Glow */}
      <div
        className="pointer-events-none fixed left-1/2 top-0 -translate-x-1/2 h-[400px] w-[600px] rounded-full opacity-10 blur-3xl"
        style={{ background: "var(--primary)" }}
      />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}