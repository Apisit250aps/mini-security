import { toast } from '@repo/ui/components/sonner';

/**
 * Interface representing the backend API error response payload
 */
export interface ApiErrorPayload {
  success?: boolean;
  message?: string;
  error?: string | { message?: string; status?: number };
  code?: string;
  details?: Record<string, unknown> | Array<unknown> | string;
}

/**
 * Formats nested Zod error structures (e.g. from result.error.format())
 * into user-friendly field error messages.
 */
function formatZodDetails(details: unknown): string | null {
  if (!details || typeof details !== 'object') return null;

  const messages: string[] = [];

  function traverse(obj: Record<string, unknown>, path: string[] = []) {
    if (Array.isArray(obj._errors) && obj._errors.length > 0) {
      const fieldErrors = obj._errors.filter(
        (e): e is string => typeof e === 'string' && e.trim().length > 0,
      );
      if (fieldErrors.length > 0) {
        const fieldName = path.join('.');
        messages.push(
          fieldName
            ? `${fieldName}: ${fieldErrors.join(', ')}`
            : fieldErrors.join(', '),
        );
      }
    }

    for (const [key, value] of Object.entries(obj)) {
      if (key === '_errors') continue;
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        traverse(value as Record<string, unknown>, [...path, key]);
      }
    }
  }

  traverse(details as Record<string, unknown>);
  return messages.length > 0 ? messages.join('\n') : null;
}

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

  // 1. Extract backend response payload if present
  const errObj =
    typeof error === 'object' && error !== null
      ? (error as Record<string, unknown>)
      : null;

  const responseData: unknown =
    (errObj?.response && typeof errObj.response === 'object'
      ? (errObj.response as Record<string, unknown>).data
      : undefined) ??
    errObj?.data ??
    errObj?.error;

  // If responseData is a non-HTML string (e.g. "Bad Gateway", ignore HTML error pages)
  if (typeof responseData === 'string' && responseData.trim()) {
    const trimmed = responseData.trim();
    if (!trimmed.startsWith('<')) {
      return trimmed;
    }
  }

  // If responseData is an object (standard Hono/API error response or Better Auth)
  if (responseData && typeof responseData === 'object') {
    const res = responseData as ApiErrorPayload;

    const validationDetails = formatZodDetails(res.details);

    if (typeof res.message === 'string' && res.message) {
      if (validationDetails) {
        return `${res.message}:\n${validationDetails}`;
      }
      return res.message;
    }

    if (typeof res.error === 'string' && res.error) {
      if (validationDetails) {
        return `${res.error}:\n${validationDetails}`;
      }
      return res.error;
    }

    // Better Auth nested: { error: { message: string } }
    if (
      res.error &&
      typeof res.error === 'object' &&
      typeof res.error.message === 'string' &&
      res.error.message
    ) {
      return res.error.message;
    }

    if (validationDetails) {
      return validationDetails;
    }
  }

  // 2. Inspect root error object directly if responseData didn't yield a message
  if (errObj) {
    if (typeof errObj.message === 'string' && errObj.message) {
      // Ignore generic Axios status messages like "Request failed with status code 400"
      const isAxiosStatus = /^Request failed with status code \d{3}$/i.test(
        errObj.message,
      );
      if (!isAxiosStatus) {
        return errObj.message;
      }
    }

    // Check status code for user-friendly fallback
    const status =
      (errObj.response && typeof errObj.response === 'object'
        ? (errObj.response as Record<string, unknown>).status
        : undefined) ?? errObj.status;

    if (status === 401) return 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง';
    if (status === 403) return 'คุณไม่มีสิทธิ์ในการเข้าถึงหรือดำเนินการนี้';
    if (status === 404) return 'ไม่พบข้อมูลที่ร้องขอ';
    if (status === 409)
      return 'ข้อมูลนี้มีอยู่ในระบบแล้ว ไม่สามารถดำเนินการซ้ำได้';
    if (status === 500)
      return 'เกิดข้อผิดพลาดที่ระบบเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง';
  }

  // 3. Fallback to standard Error message if not generic Axios status
  if (error instanceof Error && error.message) {
    const isAxiosStatus = /^Request failed with status code \d{3}$/i.test(
      error.message,
    );
    if (!isAxiosStatus) {
      return error.message;
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
