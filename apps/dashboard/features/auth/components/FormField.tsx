import { forwardRef } from "react";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  id: string;
  rightLabel?: React.ReactNode;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, id, rightLabel, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor={id}
            className="text-sm font-medium text-[var(--foreground)]"
          >
            {label}
          </label>
          {rightLabel}
        </div>

        <input
          ref={ref}
          id={id}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={!!error}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--input)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)] transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        />

        {error && (
          <p id={`${id}-error`} role="alert" className="text-xs text-[var(--destructive)]">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";

// ── Error banner ──────────────────────────────────────────────────────────

interface ErrorBannerProps {
  message: string | null | undefined;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="rounded-lg border border-[var(--destructive)]/20 bg-[var(--destructive)]/10 px-4 py-3 text-sm text-[var(--destructive)]"
    >
      {message}
    </div>
  );
}

// ── Submit button ──────────────────────────────────────────────────────────

interface SubmitButtonProps {
  loading: boolean;
  label: string;
  loadingLabel: string;
}

export function SubmitButton({ loading, label, loadingLabel }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-[var(--primary-hover)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          {loadingLabel}
        </span>
      ) : (
        label
      )}
    </button>
  );
}