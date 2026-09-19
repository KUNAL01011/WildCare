interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-2xl shadow-black/40">
      {/* Logo mark */}
      <div className="mb-6 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 17l4-8 4 4 4-6 4 10" />
          </svg>
        </div>
        <span className="text-sm font-semibold tracking-tight text-[var(--foreground)]">
          TransitOps
        </span>
      </div>

      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {subtitle}
          </p>
        )}
      </div>

      {children}
    </div>
  );
}