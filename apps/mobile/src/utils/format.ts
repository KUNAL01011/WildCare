export const capitalize = (s: string): string =>
  s.charAt(0).toUpperCase() + s.slice(1);

export const formatDate = (
  iso: string,
  opts?: Intl.DateTimeFormatOptions
): string =>
  new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...opts,
  });

export const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export const truncate = (s: string, max: number): string =>
  s.length > max ? s.slice(0, max - 1) + "…" : s;
