import { toast } from '@repo/ui/components/sonner';

/**
 * Extracts a human-readable error message from various error formats
 * (Error objects, API response errors, Better Auth errors, strings, etc.)
 */
export function getErrorMessage(
  error: unknown,
  fallbackMessage: string = 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
): string {
  if (!error) return fallbackMessage;

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message || fallbackMessage;
  }

  if (typeof error === 'object') {
    const errObj = error as Record<string, unknown>;

    if (typeof errObj.message === 'string' && errObj.message) {
      return errObj.message;
    }

    if (
      typeof errObj.error === 'object' &&
      errObj.error !== null &&
      'message' in errObj.error &&
      typeof (errObj.error as { message?: unknown }).message === 'string'
    ) {
      return (errObj.error as { message: string }).message;
    }

    if (typeof errObj.error === 'string' && errObj.error) {
      return errObj.error;
    }
  }

  return fallbackMessage;
}

/**
 * Displays an error toast notification with parsed error message.
 */
export function showErrorToast(
  error: unknown,
  fallbackMessage: string = 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
): void {
  const message = getErrorMessage(error, fallbackMessage);
  toast.error(message);
}
