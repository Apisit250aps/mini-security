/**
 * Shared optimistic-concurrency revision check, used by form submission/plan/occurrence/
 * assignment/attachment/review-entry use cases. Callers keep their own error class/message
 * since call sites disagree on whether a mismatch is a DuplicateError or BadRequestError.
 */
export function requireRevisionMatch(
  actual: number,
  expected: number | undefined | null,
  buildError: () => Error,
  options?: { optional?: boolean },
): void {
  if (options?.optional && expected == null) return;
  if (actual !== expected) throw buildError();
}
