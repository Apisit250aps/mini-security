export type DerivedSubmissionStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export function getFormSubmissionStatus(
  submission?: { submittedAt?: Date | string | null } | null,
  review?: { action?: 'APPROVE' | 'REJECT' | string | null } | null,
): DerivedSubmissionStatus {
  if (!submission?.submittedAt) {
    return 'DRAFT';
  }
  if (review?.action === 'APPROVE') {
    return 'APPROVED';
  }
  if (review?.action === 'REJECT') {
    return 'REJECTED';
  }
  return 'SUBMITTED';
}
