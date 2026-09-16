import type { IUnitOfWork } from '@repo/domains';
import type { ISecurityContext } from '@repo/domains/constants';
import type { ICompanyMemberRepository } from '@repo/domains/repositories/company';
import type {
  IFormSubmissionRepository,
  IFormAssignmentRepository,
  IFormOccurrenceRepository,
  IFormFieldRepository,
  IFormAnswerRepository,
  IFormAnswerAttachmentRepository,
  IFormSubmissionContributorRepository,
  IFormAttachmentStorage,
} from '@repo/domains/repositories/form';
import { RequirePermission } from '../../decorators/permission.decorator';
import { PermissionGuard } from '../../lib/guard';
import {
  BadRequestError,
  DuplicateError,
  NotFoundError,
  ValidationError,
} from '../../lib/error';
import {
  hasFormPermission,
  requireAssignmentMember,
  requireWritableAssignment,
} from './form-access';

const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const documentTypes = new Set([
  ...imageTypes,
  'application/pdf',
  'application/zip',
  'text/csv',
  'application/x-cfb',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);
type UploadContext = ISecurityContext & {
  submissionId: string;
  fieldId: string;
  expectedRevision: number;
  originalName: string;
  bytes: Uint8Array;
};
type AttachmentContext = ISecurityContext & {
  attachmentId: string;
  expectedRevision?: number;
};

export class FormAttachmentUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly submissionRepo: IFormSubmissionRepository,
    private readonly assignmentRepo: IFormAssignmentRepository,
    private readonly occurrenceRepo: IFormOccurrenceRepository,
    private readonly memberRepo: ICompanyMemberRepository,
    private readonly fieldRepo: IFormFieldRepository,
    private readonly answerRepo: IFormAnswerRepository,
    private readonly attachmentRepo: IFormAnswerAttachmentRepository,
    private readonly contributorRepo: IFormSubmissionContributorRepository,
    private readonly storage: IFormAttachmentStorage,
  ) {}

  @RequirePermission('form_submission:update')
  async upload(context: UploadContext) {
    if (!context.bytes.length || context.bytes.length > 10 * 1024 * 1024)
      throw new ValidationError('File must be between 1 byte and 10 MB');
    const originalName = context.originalName
      .split(/[\\/]/)
      .pop()
      ?.split('')
      .filter((character) => character.charCodeAt(0) >= 32)
      .join('')
      .slice(0, 255);
    if (!originalName) throw new ValidationError('File name is required');
    let storedKey: string | undefined;
    return this.unitOfWork
      .transaction(async () => {
        const submission = await this.submissionRepo.findById(
          context.submissionId,
        );
        if (!submission) throw new NotFoundError('Submission not found');
        const { memberId } = await requireWritableAssignment(
          context,
          submission.assignmentId,
          this.assignmentRepo,
          this.occurrenceRepo,
          this.memberRepo,
        );
        if (submission.submittedAt)
          throw new BadRequestError('Submitted attachments are immutable');
        if (submission.revision !== context.expectedRevision)
          throw new DuplicateError('Submission changed. Refresh and retry.');
        const field = await this.fieldRepo.findById(context.fieldId);
        if (
          !field ||
          field.formVersionId !== submission.formVersionId ||
          !['IMAGE', 'FILE'].includes(field.type)
        )
          throw new ValidationError('Invalid attachment field');
        const mimeType = await this.storage.identifyMimeType(
          context.bytes,
          originalName,
        );
        if (
          !mimeType ||
          !(field.type === 'IMAGE' ? imageTypes : documentTypes).has(mimeType)
        )
          throw new ValidationError('Unsupported file content');
        if (field.type === 'IMAGE' && context.bytes.length > 5 * 1024 * 1024)
          throw new ValidationError('Image exceeds 5 MB');
        const answer = await this.answerRepo.upsertAnswer({
          companyId: submission.companyId,
          submissionId: submission.id,
          formVersionId: submission.formVersionId,
          fieldId: field.id,
          value: null,
          updatedBy: memberId,
        });
        const attachments = await this.attachmentRepo.findByAnswerId(answer.id);
        if (attachments.length >= 10)
          throw new ValidationError('At most 10 attachments per answer');
        storedKey = await this.storage.put(submission.companyId, context.bytes);
        const attachment = await this.attachmentRepo.create({
          companyId: submission.companyId,
          answerId: answer.id,
          storageKey: storedKey,
          originalName,
          mimeType,
          sizeBytes: context.bytes.length,
          sortOrder: attachments.length,
          uploadedBy: memberId,
        });
        if (
          !(await this.contributorRepo.isContributor(submission.id, memberId))
        )
          await this.contributorRepo.create({
            companyId: submission.companyId,
            submissionId: submission.id,
            memberId,
          });
        await this.submissionRepo.update(submission.id, {
          revision: submission.revision + 1,
        });
        return attachment;
      })
      .catch(async (error: unknown) => {
        if (storedKey)
          await this.storage.remove(storedKey).catch(() => undefined);
        throw error;
      });
  }

  async download(context: AttachmentContext) {
    await PermissionGuard.requirePermission(
      hasFormPermission(context, 'form_review:read')
        ? 'form_review:read'
        : 'form_submission:read',
      context,
    );
    const { attachment, submission } = await this.load(context);
    if (!hasFormPermission(context, 'form_review:read')) {
      const assignment = await this.assignmentRepo.findById(
        submission.assignmentId,
      );
      if (!assignment) throw new NotFoundError('Assignment not found');
      await requireAssignmentMember(context, assignment, this.memberRepo);
    }
    return {
      attachment,
      bytes: await this.storage.read(attachment.storageKey),
    };
  }

  @RequirePermission('form_submission:update')
  async remove(context: AttachmentContext) {
    return this.unitOfWork.transaction(async () => {
      const { attachment, submission } = await this.load(context);
      const { memberId } = await requireWritableAssignment(
        context,
        submission.assignmentId,
        this.assignmentRepo,
        this.occurrenceRepo,
        this.memberRepo,
      );
      if (submission.submittedAt)
        throw new BadRequestError('Submitted attachments are immutable');
      if (submission.revision !== context.expectedRevision)
        throw new DuplicateError('Submission changed. Refresh and retry.');
      await this.attachmentRepo.delete(attachment.id);
      if (!(await this.contributorRepo.isContributor(submission.id, memberId)))
        await this.contributorRepo.create({
          companyId: submission.companyId,
          submissionId: submission.id,
          memberId,
        });
      // The immutable object may still be referenced by a previous revision.
      await this.submissionRepo.update(submission.id, {
        revision: submission.revision + 1,
      });
    });
  }

  private async load(context: AttachmentContext) {
    const attachment = await this.attachmentRepo.findById(context.attachmentId);
    if (!attachment) throw new NotFoundError('Attachment not found');
    PermissionGuard.requireCompanyScope(context, attachment.companyId);
    const answer = await this.answerRepo.findById(attachment.answerId);
    const submission =
      answer && (await this.submissionRepo.findById(answer.submissionId));
    if (!submission) throw new NotFoundError('Submission not found');
    return { attachment, submission };
  }
}
