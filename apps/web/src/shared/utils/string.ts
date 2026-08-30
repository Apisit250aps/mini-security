/**
 * Extracts initials from a name (e.g. "John Doe" -> "JD", "Somchai" -> "S").
 * Returns fallback (default "?") if name is empty or undefined.
 */
export function getInitials(
  name?: string | null,
  fallback: string = '?',
): string {
  if (!name || !name.trim()) return fallback;
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

/**
 * Truncates a string to a max length and appends an ellipsis.
 */
export function truncate(
  str?: string | null,
  maxLength: number = 50,
  ellipsis: string = '...',
): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}${ellipsis}`;
}

/**
 * Capitalizes the first letter of a string.
 */
export function capitalize(str?: string | null): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
