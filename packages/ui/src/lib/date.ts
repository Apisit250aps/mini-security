export const THAI_TIME_ZONE = 'Asia/Bangkok';
export const THAI_LOCALE = 'th-TH';

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
 * Formats a date into a localized date string (e.g. "30 ส.ค. 2569").
 * Returns fallback (default "-") if date is invalid or null.
 */
export function formatDate(
  date: Date | string | number | null | undefined,
  locale: string = THAI_LOCALE,
  options?: Intl.DateTimeFormatOptions,
  fallback: string = '-',
): string {
  const d = toDate(date);
  if (!d) return fallback;
  return d.toLocaleDateString(locale, {
    timeZone: THAI_TIME_ZONE,
    ...(options ?? { day: 'numeric', month: 'short', year: 'numeric' }),
  });
}

/**
 * Formats a date into a localized date & time string (e.g. "30 ส.ค. 2569 13:55:00").
 * Returns fallback (default "-") if date is invalid or null.
 */
export function formatDateTime(
  date: Date | string | number | null | undefined,
  locale: string = THAI_LOCALE,
  options?: Intl.DateTimeFormatOptions,
  fallback: string = '-',
): string {
  const d = toDate(date);
  if (!d) return fallback;
  return d.toLocaleString(locale, {
    timeZone: THAI_TIME_ZONE,
    hourCycle: 'h23',
    ...(options ?? {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  });
}

/**
 * Formats a date into a localized time string (e.g. "13:55:00").
 * Returns fallback (default "-") if date is invalid or null.
 */
export function formatTime(
  date: Date | string | number | null | undefined,
  locale: string = THAI_LOCALE,
  options?: Intl.DateTimeFormatOptions,
  fallback: string = '-',
): string {
  const d = toDate(date);
  if (!d) return fallback;
  return d.toLocaleTimeString(locale, {
    timeZone: THAI_TIME_ZONE,
    hourCycle: 'h23',
    ...(options ?? { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  });
}

/** Formats inclusive calendar dates without changing their stored ISO values. */
export function formatDateRange(
  start: Date | string | number | null | undefined,
  end: Date | string | number | null | undefined,
): string {
  if (!toDate(start) || !toDate(end)) return '-';
  return `${formatDate(start)} ถึง ${formatDate(end)}`;
}
