import { RequirePermission } from '../../decorators/permission.decorator';
import type { FormSubmission } from '@repo/domains/entities/form';
import type {
  ICloneFormSubmissionContext,
  ICloneFormSubmissionUseCase,
  IGetFormSubmissionContext,
  IGetFormSubmissionUseCase,
  IListFormSubmissionsContext,
  IListFormSubmissionsUseCase,
  ISaveFormSubmissionDraftContext,
  ISaveFormSubmissionDraftUseCase,
  IStartFormSubmissionContext,
  IStartFormSubmissionUseCase,
  ISubmitFormSubmissionContext,
  ISubmitFormSubmissionUseCase,
  FormSubmissionDetail,
} from '@repo/domains/applications/form';
import type {
  IFormAnswerAttachmentRepository,
  IFormAnswerRepository,
  IFormFieldRepository,
  IFormSectionRepository,
  IFormSubmissionContributorRepository,
  IFormSubmissionRepository,
  IFormTemplateRepository,
  IFormTemplateRoleRepository,
  IFormVersionRepository,
  ISubmissionReviewRepository,
} from '@repo/domains/repositories/form';
import {
  BadRequestError,
  DuplicateError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../../lib/error';

// ==========================================
// 1. Start Form Submission (Shared Draft)
// ==========================================

export class StartFormSubmissionUseCase implements IStartFormSubmissionUseCase {
  constructor(
    private readonly submissionRepo: IFormSubmissionRepository,
    private readonly templateRepo: IFormTemplateRepository,
    private readonly templateRoleRepo: IFormTemplateRoleRepository,
    private readonly versionRepo: IFormVersionRepository,
    private readonly contributorRepo: IFormSubmissionContributorRepository,
  ) {}

  @RequirePermission('form_submission:create')
  async execute(context: IStartFormSubmissionContext): Promise<FormSubmission> {
    const template = await this.templateRepo.findById(context.formTemplateId);
    if (!template || !template.isActive) {
      throw new BadRequestError('Form template is inactive or not found');
    }

    // Verify role has access
    const roleAccess = await this.templateRoleRepo.findByTemplateAndRole(
      context.formTemplateId,
      context.roleId,
    );
    if (!roleAccess || !roleAccess.isEnabled) {
      throw new ForbiddenError(
        'Your role does not have permission to start this form',
      );
    }

    // Get current published version
    const publishedVersion = await this.versionRepo.findPublishedByTemplateId(
      context.formTemplateId,
    );
    if (!publishedVersion) {
      throw new BadRequestError(
        'Form has no published version available for submissions',
      );
    }

    // If an active shared draft already exists for this role & template, join it!
    const existingDraft = await this.submissionRepo.findDraftByRoleAndTemplate(
      context.roleId,
      context.formTemplateId,
      template.companyId,
    );

    if (existingDraft) {
      const alreadyContributor = await this.contributorRepo.isContributor(
        existingDraft.id,
        context.memberId,
      );
      if (!alreadyContributor) {
        await this.contributorRepo.create({
          companyId: template.companyId,
          submissionId: existingDraft.id,
          memberId: context.memberId,
        });
      }
      return existingDraft;
    }

    const submission = await this.submissionRepo.create({
      companyId: template.companyId,
      formTemplateId: template.id,
      formVersionId: publishedVersion.id,
      roleId: context.roleId,
      startedBy: context.memberId,
      submittedBy: null,
      revision: 1,
      supersedesSubmissionId: null,
      status: 'DRAFT',
      startedAt: new Date(),
      submittedAt: null,
    });

    // Record initial contributor
    await this.contributorRepo.create({
      companyId: template.companyId,
      submissionId: submission.id,
      memberId: context.memberId,
    });

    return submission;
  }
}

// ==========================================
// 2. Save Form Submission Draft (Optimistic Concurrency)
// ==========================================

export class SaveFormSubmissionDraftUseCase
  implements ISaveFormSubmissionDraftUseCase
{
  constructor(
    private readonly submissionRepo: IFormSubmissionRepository,
    private readonly answerRepo: IFormAnswerRepository,
    private readonly contributorRepo: IFormSubmissionContributorRepository,
  ) {}

  @RequirePermission('form_submission:update')
  async execute(
    context: ISaveFormSubmissionDraftContext,
  ): Promise<FormSubmission> {
    const submission = await this.submissionRepo.findById(context.submissionId);
    if (!submission) {
      throw new NotFoundError('Form submission not found');
    }
    if (submission.status !== 'DRAFT') {
      throw new BadRequestError(
        'Cannot edit answers for a submitted or reviewed form',
      );
    }

    // Optimistic Concurrency Check
    if (submission.revision !== context.expectedRevision) {
      throw new DuplicateError(
        'Optimistic lock conflict: form submission has been modified by another contributor. Please refresh and retry.',
      );
    }

    // Upsert provided answers
    for (const ans of context.answers) {
      await this.answerRepo.upsertAnswer({
        companyId: submission.companyId,
        formVersionId: submission.formVersionId,
        submissionId: submission.id,
        fieldId: ans.fieldId,
        value: ans.value ?? null,
        updatedBy: context.memberId,
      });
    }

    // Ensure actor is recorded as contributor
    const isContributor = await this.contributorRepo.isContributor(
      submission.id,
      context.memberId,
    );
    if (!isContributor) {
      await this.contributorRepo.create({
        companyId: submission.companyId,
        submissionId: submission.id,
        memberId: context.memberId,
      });
    }

    // Increment revision
    return this.submissionRepo.update(submission.id, {
      revision: submission.revision + 1,
    });
  }
}

// ==========================================
// 3. Submit Form Submission
// ==========================================

export class SubmitFormSubmissionUseCase
  implements ISubmitFormSubmissionUseCase
{
  constructor(
    private readonly submissionRepo: IFormSubmissionRepository,
    private readonly fieldRepo: IFormFieldRepository,
    private readonly answerRepo: IFormAnswerRepository,
    private readonly attachmentRepo: IFormAnswerAttachmentRepository,
    private readonly contributorRepo: IFormSubmissionContributorRepository,
  ) {}

  @RequirePermission('form_submission:submit')
  async execute(
    context: ISubmitFormSubmissionContext,
  ): Promise<FormSubmission> {
    const submission = await this.submissionRepo.findById(context.submissionId);
    if (!submission) {
      throw new NotFoundError('Form submission not found');
    }
    if (submission.status !== 'DRAFT') {
      throw new BadRequestError(
        'Cannot submit an already submitted or closed response',
      );
    }

    // Optimistic Concurrency Check
    if (submission.revision !== context.expectedRevision) {
      throw new DuplicateError(
        'Optimistic lock conflict: form submission has been modified. Please review and submit again.',
      );
    }

    // Validate required fields
    const fields = await this.fieldRepo.findByVersionId(
      submission.formVersionId,
    );
    const answers = await this.answerRepo.findBySubmissionId(submission.id);
    const answerMap = new Map(answers.map((a) => [a.fieldId, a]));

    for (const field of fields) {
      if (field.isRequired) {
        const answer = answerMap.get(field.id);
        if (field.type === 'IMAGE' || field.type === 'FILE') {
          if (!answer) {
            throw new ValidationError(
              `Required field "${field.label}" has no attachments`,
            );
          }
          const attachments = await this.attachmentRepo.findByAnswerId(
            answer.id,
          );
          if (attachments.length === 0) {
            throw new ValidationError(
              `Required field "${field.label}" requires at least one attachment`,
            );
          }
        } else {
          // 0 and false are considered valid answers!
          if (
            !answer ||
            answer.value === null ||
            answer.value === undefined ||
            answer.value === ''
          ) {
            throw new ValidationError(
              `Required question "${field.label}" must be answered before submitting`,
            );
          }
        }
      }
    }

    // Ensure submitter is recorded as contributor
    const isContributor = await this.contributorRepo.isContributor(
      submission.id,
      context.memberId,
    );
    if (!isContributor) {
      await this.contributorRepo.create({
        companyId: submission.companyId,
        submissionId: submission.id,
        memberId: context.memberId,
      });
    }

    // Finalize submission
    return this.submissionRepo.update(submission.id, {
      status: 'SUBMITTED',
      submittedBy: context.memberId,
      submittedAt: new Date(),
      revision: submission.revision + 1,
    });
  }
}

// ==========================================
// 4. Clone Form Submission (Rework Rejected Response)
// ==========================================

export class CloneFormSubmissionUseCase implements ICloneFormSubmissionUseCase {
  constructor(
    private readonly submissionRepo: IFormSubmissionRepository,
    private readonly answerRepo: IFormAnswerRepository,
    private readonly attachmentRepo: IFormAnswerAttachmentRepository,
    private readonly contributorRepo: IFormSubmissionContributorRepository,
  ) {}

  @RequirePermission('form_submission:create')
  async execute(context: ICloneFormSubmissionContext): Promise<FormSubmission> {
    const original = await this.submissionRepo.findById(context.submissionId);
    if (!original) {
      throw new NotFoundError('Original submission not found');
    }
    if (original.status !== 'REJECTED') {
      throw new BadRequestError('Only REJECTED submissions can be cloned');
    }

    // Prevent duplicate clones for the same rejected submission
    const existingClone = await this.submissionRepo.findBySupersedesId(
      original.id,
    );
    if (existingClone) {
      throw new DuplicateError(
        'A rework submission for this rejected response already exists',
      );
    }

    // Create new submission referencing supersedesSubmissionId
    const clone = await this.submissionRepo.create({
      companyId: original.companyId,
      formTemplateId: original.formTemplateId,
      formVersionId: original.formVersionId,
      roleId: original.roleId,
      startedBy: context.memberId,
      submittedBy: null,
      revision: 1,
      supersedesSubmissionId: original.id,
      status: 'DRAFT',
      startedAt: new Date(),
      submittedAt: null,
    });

    // Copy original answers & attachment metadata
    const originalAnswers = await this.answerRepo.findBySubmissionId(
      original.id,
    );
    for (const ans of originalAnswers) {
      const newAnswer = await this.answerRepo.create({
        companyId: original.companyId,
        formVersionId: original.formVersionId,
        submissionId: clone.id,
        fieldId: ans.fieldId,
        value: ans.value ?? null,
        updatedBy: ans.updatedBy, // preserve original actor
      });

      const attachments = await this.attachmentRepo.findByAnswerId(ans.id);
      for (const att of attachments) {
        await this.attachmentRepo.create({
          companyId: original.companyId,
          answerId: newAnswer.id,
          storageKey: att.storageKey,
          originalName: att.originalName,
          mimeType: att.mimeType,
          sizeBytes: att.sizeBytes,
          sortOrder: att.sortOrder,
          uploadedBy: att.uploadedBy, // preserve original uploader
        });
      }
    }

    // Preserve previous contributors and add current clone actor
    const originalContributors = await this.contributorRepo.findBySubmissionId(
      original.id,
    );
    const memberIdSet = new Set(originalContributors.map((c) => c.memberId));
    memberIdSet.add(context.memberId);

    for (const memberId of memberIdSet) {
      await this.contributorRepo.create({
        companyId: original.companyId,
        submissionId: clone.id,
        memberId,
      });
    }

    return clone;
  }
}

// ==========================================
// 5. Get Form Submission Detail
// ==========================================

export class GetFormSubmissionUseCase implements IGetFormSubmissionUseCase {
  constructor(
    private readonly submissionRepo: IFormSubmissionRepository,
    private readonly templateRepo: IFormTemplateRepository,
    private readonly versionRepo: IFormVersionRepository,
    private readonly sectionRepo: IFormSectionRepository,
    private readonly fieldRepo: IFormFieldRepository,
    private readonly answerRepo: IFormAnswerRepository,
    private readonly contributorRepo: IFormSubmissionContributorRepository,
    private readonly reviewRepo: ISubmissionReviewRepository,
  ) {}

  @RequirePermission('form_submission:read')
  async execute(
    context: IGetFormSubmissionContext,
  ): Promise<FormSubmissionDetail | null> {
    const submission = await this.submissionRepo.findById(context.id);
    if (!submission) return null;

    const [template, version, sections, fields, answers, contributors, review] =
      await Promise.all([
        this.templateRepo.findById(submission.formTemplateId),
        this.versionRepo.findById(submission.formVersionId),
        this.sectionRepo.findByVersionId(submission.formVersionId),
        this.fieldRepo.findByVersionId(submission.formVersionId),
        this.answerRepo.findBySubmissionId(submission.id),
        this.contributorRepo.findBySubmissionId(submission.id),
        this.reviewRepo.findBySubmissionId(submission.id),
      ]);

    return {
      submission,
      template,
      version,
      sections,
      fields,
      answers,
      contributors,
      review,
    };
  }
}

// ==========================================
// 6. List Form Submissions
// ==========================================

export class ListFormSubmissionsUseCase implements IListFormSubmissionsUseCase {
  constructor(private readonly submissionRepo: IFormSubmissionRepository) {}

  @RequirePermission('form_submission:read')
  async execute(
    context: IListFormSubmissionsContext,
  ): Promise<FormSubmission[]> {
    if (context.companyId && context.roleId && context.formTemplateId) {
      return this.submissionRepo.findByTemplateAndRole(
        context.formTemplateId,
        context.roleId,
        context.companyId,
      );
    }
    if (context.companyId && context.roleId) {
      return this.submissionRepo.findByRoleId(
        context.roleId,
        context.companyId,
      );
    }
    if (context.companyId) {
      return this.submissionRepo.findByCompanyId(context.companyId);
    }
    return this.submissionRepo.findAll();
  }
}
