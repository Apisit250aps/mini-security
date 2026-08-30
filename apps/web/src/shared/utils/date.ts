/**
 * Safely parses input into a valid Date object.
 */
function toDate(date: Date | string | number | null | undefined): Date | null {
  if (date === null || date === undefined || date === '') {
    return null;
  }
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Formats a date into a localized date string (e.g. "30/8/2026").
 * Returns fallback (default "-") if date is invalid or null.
 */
export function formatDate(
  date: Date | string | number | null | undefined,
  locale: string = 'th-TH',
  options?: Intl.DateTimeFormatOptions,
  fallback: string = '-',
): string {
  const d = toDate(date);
  if (!d) return fallback;
  return d.toLocaleDateString(locale, options);
}

/**
 * Formats a date into a localized date & time string (e.g. "30/8/2026, 13:55:00").
 * Returns fallback (default "-") if date is invalid or null.
 */
export function formatDateTime(
  date: Date | string | number | null | undefined,
  locale: string = 'th-TH',
  options?: Intl.DateTimeFormatOptions,
  fallback: string = '-',
): string {
  const d = toDate(date);
  if (!d) return fallback;
  return d.toLocaleString(locale, options);
}

/**
 * Formats a date into a localized time string (e.g. "13:55:00").
 * Returns fallback (default "-") if date is invalid or null.
 */
export function formatTime(
  date: Date | string | number | null | undefined,
  locale: string = 'th-TH',
  options?: Intl.DateTimeFormatOptions,
  fallback: string = '-',
): string {
  const d = toDate(date);
  if (!d) return fallback;
  return d.toLocaleTimeString(locale, options);
}
