import { and, asc, desc, eq, inArray } from 'drizzle-orm';
import { resolveDatabase } from '@repo/database/transaction';
import type { Database } from '@repo/database/db';
import { Repository } from '@repo/database/repository';
import {
  formAnswer,
  formAnswerAttachment,
  formField,
  formSection,
  formSubmission,
  formSubmissionContributor,
  formTemplate,
  formTemplateRole,
  formVersion,
  submissionReview,
} from '@repo/database/schema';
import {
  FormAnswer,
  FormAnswerAttachment,
  FormField,
  FormSection,
  FormSubmission,
  FormSubmissionContributor,
  FormTemplate,
  FormTemplateRole,
  FormVersion,
  SubmissionReview,
} from '@repo/domains/entities/form';
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
import type {
  CreateFormAnswer,
  CreateFormAnswerAttachment,
  CreateFormField,
  CreateFormSection,
  CreateFormSubmission,
  CreateFormSubmissionContributor,
  CreateFormTemplate,
  CreateFormTemplateRole,
  CreateFormVersion,
  CreateSubmissionReview,
  UpdateFormAnswer,
  UpdateFormField,
  UpdateFormSection,
  UpdateFormSubmission,
  UpdateFormTemplate,
  UpdateFormTemplateRole,
  UpdateFormVersion,
} from '@repo/domains/schema/form';

// ==========================================
// 1. Form Template Repository
// ==========================================

export class FormTemplateRepository
  extends Repository<FormTemplate, CreateFormTemplate, UpdateFormTemplate>
  implements IFormTemplateRepository
{
  constructor(db: Database) {
    super(db, formTemplate);
  }

  async findByCompanyId(companyId: string): Promise<FormTemplate[]> {
    const results = await this.db
      .select()
      .from(formTemplate)
      .where(eq(formTemplate.companyId, companyId))
      .orderBy(desc(formTemplate.createdAt));
    return results.map((r) => new FormTemplate(r as unknown as FormTemplate));
  }

  async findByIdAndCompany(
    id: string,
    companyId: string,
  ): Promise<FormTemplate | null> {
    const [result] = await this.db
      .select()
      .from(formTemplate)
      .where(
        and(eq(formTemplate.id, id), eq(formTemplate.companyId, companyId)),
      );
    return result ? new FormTemplate(result as unknown as FormTemplate) : null;
  }
}

// ==========================================
// 2. Form Template Role Repository
// ==========================================

export class FormTemplateRoleRepository
  extends Repository<
    FormTemplateRole,
    CreateFormTemplateRole,
    UpdateFormTemplateRole
  >
  implements IFormTemplateRoleRepository
{
  constructor(db: Database) {
    super(db, formTemplateRole);
  }

  async findByTemplateId(templateId: string): Promise<FormTemplateRole[]> {
    const results = await this.db
      .select()
      .from(formTemplateRole)
      .where(eq(formTemplateRole.formTemplateId, templateId));
    return results.map(
      (r) => new FormTemplateRole(r as unknown as FormTemplateRole),
    );
  }

  async findByTemplateAndRole(
    templateId: string,
    roleId: string,
  ): Promise<FormTemplateRole | null> {
    const [result] = await this.db
      .select()
      .from(formTemplateRole)
      .where(
        and(
          eq(formTemplateRole.formTemplateId, templateId),
          eq(formTemplateRole.roleId, roleId),
        ),
      );
    return result
      ? new FormTemplateRole(result as unknown as FormTemplateRole)
      : null;
  }

  async findEnabledByCompanyAndRole(
    companyId: string,
    roleId: string,
  ): Promise<FormTemplateRole[]> {
    const results = await this.db
      .select()
      .from(formTemplateRole)
      .where(
        and(
          eq(formTemplateRole.companyId, companyId),
          eq(formTemplateRole.roleId, roleId),
          eq(formTemplateRole.isEnabled, true),
        ),
      );
    return results.map(
      (r) => new FormTemplateRole(r as unknown as FormTemplateRole),
    );
  }

  async deleteByTemplateId(templateId: string): Promise<void> {
    await this.db
      .delete(formTemplateRole)
      .where(eq(formTemplateRole.formTemplateId, templateId));
  }
}

// ==========================================
// 3. Form Version Repository
// ==========================================

export class FormVersionRepository
  extends Repository<FormVersion, CreateFormVersion, UpdateFormVersion>
  implements IFormVersionRepository
{
  constructor(db: Database) {
    super(db, formVersion);
  }

  async findByTemplateId(templateId: string): Promise<FormVersion[]> {
    const results = await this.db
      .select()
      .from(formVersion)
      .where(eq(formVersion.formTemplateId, templateId))
      .orderBy(desc(formVersion.version));
    return results.map((r) => new FormVersion(r as unknown as FormVersion));
  }

  async findPublishedByTemplateId(
    templateId: string,
  ): Promise<FormVersion | null> {
    const [result] = await this.db
      .select()
      .from(formVersion)
      .where(
        and(
          eq(formVersion.formTemplateId, templateId),
          eq(formVersion.status, 'PUBLISHED'),
        ),
      );
    return result ? new FormVersion(result as unknown as FormVersion) : null;
  }

  async findDraftByTemplateId(templateId: string): Promise<FormVersion | null> {
    const [result] = await this.db
      .select()
      .from(formVersion)
      .where(
        and(
          eq(formVersion.formTemplateId, templateId),
          eq(formVersion.status, 'DRAFT'),
        ),
      );
    return result ? new FormVersion(result as unknown as FormVersion) : null;
  }

  async findByTemplateAndVersion(
    templateId: string,
    version: number,
  ): Promise<FormVersion | null> {
    const [result] = await this.db
      .select()
      .from(formVersion)
      .where(
        and(
          eq(formVersion.formTemplateId, templateId),
          eq(formVersion.version, version),
        ),
      );
    return result ? new FormVersion(result as unknown as FormVersion) : null;
  }

  async getLatestVersionNumber(templateId: string): Promise<number> {
    const [result] = await this.db
      .select({ version: formVersion.version })
      .from(formVersion)
      .where(eq(formVersion.formTemplateId, templateId))
      .orderBy(desc(formVersion.version))
      .limit(1);
    return result?.version ?? 0;
  }
}

// ==========================================
// 4. Form Section Repository
// ==========================================

export class FormSectionRepository
  extends Repository<FormSection, CreateFormSection, UpdateFormSection>
  implements IFormSectionRepository
{
  constructor(db: Database) {
    super(db, formSection);
  }

  async findByVersionId(versionId: string): Promise<FormSection[]> {
    const results = await this.db
      .select()
      .from(formSection)
      .where(eq(formSection.formVersionId, versionId))
      .orderBy(asc(formSection.sortOrder), asc(formSection.createdAt));
    return results.map((r) => new FormSection(r as unknown as FormSection));
  }

  async deleteByVersionId(versionId: string): Promise<void> {
    await this.db
      .delete(formSection)
      .where(eq(formSection.formVersionId, versionId));
  }
}

// ==========================================
// 5. Form Field Repository
// ==========================================

export class FormFieldRepository
  extends Repository<FormField, CreateFormField, UpdateFormField>
  implements IFormFieldRepository
{
  constructor(db: Database) {
    super(db, formField);
  }

  async findByVersionId(versionId: string): Promise<FormField[]> {
    const results = await this.db
      .select()
      .from(formField)
      .where(eq(formField.formVersionId, versionId))
      .orderBy(asc(formField.sortOrder), asc(formField.createdAt));
    return results.map((r) => new FormField(r as unknown as FormField));
  }

  async findBySectionId(sectionId: string): Promise<FormField[]> {
    const results = await this.db
      .select()
      .from(formField)
      .where(eq(formField.formSectionId, sectionId))
      .orderBy(asc(formField.sortOrder), asc(formField.createdAt));
    return results.map((r) => new FormField(r as unknown as FormField));
  }

  async deleteByVersionId(versionId: string): Promise<void> {
    await this.db
      .delete(formField)
      .where(eq(formField.formVersionId, versionId));
  }
}

// ==========================================
// 6. Form Submission Repository
// ==========================================

export class FormSubmissionRepository
  extends Repository<FormSubmission, CreateFormSubmission, UpdateFormSubmission>
  implements IFormSubmissionRepository
{
  constructor(db: Database) {
    super(db, formSubmission);
  }

  async findByCompanyId(companyId: string): Promise<FormSubmission[]> {
    const results = await this.db
      .select()
      .from(formSubmission)
      .where(eq(formSubmission.companyId, companyId))
      .orderBy(desc(formSubmission.createdAt));
    return results.map(
      (r) => new FormSubmission(r as unknown as FormSubmission),
    );
  }

  async findByRoleId(
    roleId: string,
    companyId: string,
  ): Promise<FormSubmission[]> {
    const results = await this.db
      .select()
      .from(formSubmission)
      .where(
        and(
          eq(formSubmission.roleId, roleId),
          eq(formSubmission.companyId, companyId),
        ),
      )
      .orderBy(desc(formSubmission.createdAt));
    return results.map(
      (r) => new FormSubmission(r as unknown as FormSubmission),
    );
  }

  async findByTemplateAndRole(
    templateId: string,
    roleId: string,
    companyId: string,
  ): Promise<FormSubmission[]> {
    const results = await this.db
      .select()
      .from(formSubmission)
      .where(
        and(
          eq(formSubmission.formTemplateId, templateId),
          eq(formSubmission.roleId, roleId),
          eq(formSubmission.companyId, companyId),
        ),
      )
      .orderBy(desc(formSubmission.createdAt));
    return results.map(
      (r) => new FormSubmission(r as unknown as FormSubmission),
    );
  }

  async findDraftByRoleAndTemplate(
    roleId: string,
    templateId: string,
    companyId: string,
  ): Promise<FormSubmission | null> {
    const [result] = await this.db
      .select()
      .from(formSubmission)
      .where(
        and(
          eq(formSubmission.roleId, roleId),
          eq(formSubmission.formTemplateId, templateId),
          eq(formSubmission.companyId, companyId),
          eq(formSubmission.status, 'DRAFT'),
        ),
      )
      .orderBy(desc(formSubmission.createdAt))
      .limit(1);
    return result
      ? new FormSubmission(result as unknown as FormSubmission)
      : null;
  }

  async findBySupersedesId(
    supersedesId: string,
  ): Promise<FormSubmission | null> {
    const [result] = await this.db
      .select()
      .from(formSubmission)
      .where(eq(formSubmission.supersedesSubmissionId, supersedesId));
    return result
      ? new FormSubmission(result as unknown as FormSubmission)
      : null;
  }
}

// ==========================================
// 7. Form Submission Contributor Repository
// ==========================================

export class FormSubmissionContributorRepository
  implements IFormSubmissionContributorRepository
{
  constructor(private readonly database: Database) {}

  private get db() {
    return resolveDatabase(this.database);
  }

  async findBySubmissionId(
    submissionId: string,
  ): Promise<FormSubmissionContributor[]> {
    const results = await this.db
      .select()
      .from(formSubmissionContributor)
      .where(eq(formSubmissionContributor.submissionId, submissionId));
    return results.map(
      (r) =>
        new FormSubmissionContributor(
          r as unknown as FormSubmissionContributor,
        ),
    );
  }

  async create(
    entity: CreateFormSubmissionContributor,
  ): Promise<FormSubmissionContributor> {
    const [result] = await this.db
      .insert(formSubmissionContributor)
      .values(entity)
      .returning();
    return new FormSubmissionContributor(
      result as unknown as FormSubmissionContributor,
    );
  }

  async isContributor(
    submissionId: string,
    memberId: string,
  ): Promise<boolean> {
    const [result] = await this.db
      .select({ id: formSubmissionContributor.id })
      .from(formSubmissionContributor)
      .where(
        and(
          eq(formSubmissionContributor.submissionId, submissionId),
          eq(formSubmissionContributor.memberId, memberId),
        ),
      )
      .limit(1);
    return !!result;
  }

  async findMemberIdsForRevisionLineage(
    submissionId: string,
  ): Promise<string[]> {
    const memberIds = new Set<string>();
    let currentId: string | null = submissionId;

    while (currentId) {
      const contributors = await this.findBySubmissionId(currentId);
      for (const c of contributors) {
        memberIds.add(c.memberId);
      }

      const [sub] = await this.db
        .select({ supersedes: formSubmission.supersedesSubmissionId })
        .from(formSubmission)
        .where(eq(formSubmission.id, currentId));

      currentId = sub?.supersedes ?? null;
    }

    return Array.from(memberIds);
  }
}

// ==========================================
// 8. Form Answer Repository
// ==========================================

export class FormAnswerRepository
  extends Repository<FormAnswer, CreateFormAnswer, UpdateFormAnswer>
  implements IFormAnswerRepository
{
  constructor(db: Database) {
    super(db, formAnswer);
  }

  async findBySubmissionId(submissionId: string): Promise<FormAnswer[]> {
    const results = await this.db
      .select()
      .from(formAnswer)
      .where(eq(formAnswer.submissionId, submissionId));
    return results.map((r) => new FormAnswer(r as unknown as FormAnswer));
  }

  async findBySubmissionAndField(
    submissionId: string,
    fieldId: string,
  ): Promise<FormAnswer | null> {
    const [result] = await this.db
      .select()
      .from(formAnswer)
      .where(
        and(
          eq(formAnswer.submissionId, submissionId),
          eq(formAnswer.fieldId, fieldId),
        ),
      );
    return result ? new FormAnswer(result as unknown as FormAnswer) : null;
  }

  async upsertAnswer(answer: CreateFormAnswer): Promise<FormAnswer> {
    const existing = await this.findBySubmissionAndField(
      answer.submissionId,
      answer.fieldId,
    );
    if (existing) {
      return this.update(existing.id, {
        value: answer.value,
        updatedBy: answer.updatedBy,
      });
    }
    return this.create(answer);
  }
}

// ==========================================
// 9. Form Answer Attachment Repository
// ==========================================

export class FormAnswerAttachmentRepository
  implements IFormAnswerAttachmentRepository
{
  constructor(private readonly database: Database) {}

  private get db() {
    return resolveDatabase(this.database);
  }

  async findById(id: string): Promise<FormAnswerAttachment | null> {
    const [result] = await this.db
      .select()
      .from(formAnswerAttachment)
      .where(eq(formAnswerAttachment.id, id));
    return result
      ? new FormAnswerAttachment(result as unknown as FormAnswerAttachment)
      : null;
  }

  async findByAnswerId(answerId: string): Promise<FormAnswerAttachment[]> {
    const results = await this.db
      .select()
      .from(formAnswerAttachment)
      .where(eq(formAnswerAttachment.answerId, answerId))
      .orderBy(asc(formAnswerAttachment.sortOrder));
    return results.map(
      (r) => new FormAnswerAttachment(r as unknown as FormAnswerAttachment),
    );
  }

  async findByAnswerIds(answerIds: string[]): Promise<FormAnswerAttachment[]> {
    if (answerIds.length === 0) return [];
    const results = await this.db
      .select()
      .from(formAnswerAttachment)
      .where(inArray(formAnswerAttachment.answerId, answerIds))
      .orderBy(asc(formAnswerAttachment.sortOrder));
    return results.map(
      (r) => new FormAnswerAttachment(r as unknown as FormAnswerAttachment),
    );
  }

  async create(
    attachment: CreateFormAnswerAttachment,
  ): Promise<FormAnswerAttachment> {
    const [result] = await this.db
      .insert(formAnswerAttachment)
      .values(attachment)
      .returning();
    return new FormAnswerAttachment(result as unknown as FormAnswerAttachment);
  }

  async delete(id: string): Promise<void> {
    await this.db
      .delete(formAnswerAttachment)
      .where(eq(formAnswerAttachment.id, id));
  }
}

// ==========================================
// 10. Submission Review Repository
// ==========================================

export class SubmissionReviewRepository implements ISubmissionReviewRepository {
  constructor(private readonly database: Database) {}

  private get db() {
    return resolveDatabase(this.database);
  }

  async findById(id: string): Promise<SubmissionReview | null> {
    const [result] = await this.db
      .select()
      .from(submissionReview)
      .where(eq(submissionReview.id, id));
    return result
      ? new SubmissionReview(result as unknown as SubmissionReview)
      : null;
  }

  async findBySubmissionId(
    submissionId: string,
  ): Promise<SubmissionReview | null> {
    const [result] = await this.db
      .select()
      .from(submissionReview)
      .where(eq(submissionReview.submissionId, submissionId));
    return result
      ? new SubmissionReview(result as unknown as SubmissionReview)
      : null;
  }

  async findByCompanyId(companyId: string): Promise<SubmissionReview[]> {
    const results = await this.db
      .select()
      .from(submissionReview)
      .where(eq(submissionReview.companyId, companyId))
      .orderBy(desc(submissionReview.createdAt));
    return results.map(
      (r) => new SubmissionReview(r as unknown as SubmissionReview),
    );
  }

  async create(review: CreateSubmissionReview): Promise<SubmissionReview> {
    const [result] = await this.db
      .insert(submissionReview)
      .values(review)
      .returning();
    return new SubmissionReview(result as unknown as SubmissionReview);
  }
}
