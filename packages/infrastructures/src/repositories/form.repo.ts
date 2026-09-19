import {
  and,
  asc,
  desc,
  eq,
  inArray,
  isNull,
  isNotNull,
  sql,
  notInArray,
} from 'drizzle-orm';
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
  formVersion,
  formPlan,
  formPlanTarget,
  formPlanPeriod,
  formOccurrence,
  formAssignment,
  formReviewEntry,
} from '@repo/database/schema';
import {
  FormAnswer,
  FormAnswerAttachment,
  FormField,
  FormSection,
  FormSubmission,
  FormSubmissionContributor,
  FormTemplate,
  FormVersion,
  FormPlan,
  FormPlanTarget,
  FormPlanPeriod,
  FormOccurrence,
  FormAssignment,
  FormReviewEntry,
} from '@repo/domains/entities/form';
import type {
  IFormAnswerAttachmentRepository,
  IFormAnswerRepository,
  IFormFieldRepository,
  IFormSectionRepository,
  IFormSubmissionContributorRepository,
  IFormSubmissionRepository,
  IFormTemplateRepository,
  IFormVersionRepository,
  IFormPlanRepository,
  IFormPlanTargetRepository,
  IFormPlanPeriodRepository,
  IFormOccurrenceRepository,
  IFormAssignmentRepository,
  IFormReviewEntryRepository,
} from '@repo/domains/repositories/form';
import type {
  CreateFormAnswer,
  CreateFormAnswerAttachment,
  CreateFormField,
  CreateFormSection,
  CreateFormSubmission,
  CreateFormSubmissionContributor,
  CreateFormTemplate,
  CreateFormVersion,
  UpdateFormAnswer,
  UpdateFormField,
  UpdateFormSection,
  UpdateFormSubmission,
  UpdateFormTemplate,
  UpdateFormVersion,
  CreateFormPlan,
  UpdateFormPlan,
  CreateFormPlanTarget,
  CreateFormPlanPeriod,
  CreateFormOccurrence,
  UpdateFormOccurrence,
  CreateFormAssignment,
  UpdateFormAssignment,
  CreateFormReviewEntry,
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
// 2. Form Version Repository
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
// 3. Form Section Repository
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

  async reorderItems(
    items: Array<{ id: string; sortOrder: number }>,
  ): Promise<void> {
    await Promise.all(
      items.map(({ id, sortOrder }) =>
        this.db
          .update(formSection)
          .set({ sortOrder, updatedAt: new Date() })
          .where(eq(formSection.id, id)),
      ),
    );
  }
}

// ==========================================
// 4. Form Field Repository
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

  async reorderItems(
    items: Array<{ id: string; sortOrder: number }>,
  ): Promise<void> {
    await Promise.all(
      items.map(({ id, sortOrder }) =>
        this.db
          .update(formField)
          .set({ sortOrder, updatedAt: new Date() })
          .where(eq(formField.id, id)),
      ),
    );
  }
}

// ==========================================
// 5. Form Plan Repository
// ==========================================

export class FormPlanRepository
  extends Repository<FormPlan, CreateFormPlan, UpdateFormPlan>
  implements IFormPlanRepository
{
  constructor(db: Database) {
    super(db, formPlan);
  }

  async findByTemplateId(
    templateId: string,
    companyId: string,
  ): Promise<FormPlan[]> {
    const results = await this.db
      .select()
      .from(formPlan)
      .where(
        and(
          eq(formPlan.formTemplateId, templateId),
          eq(formPlan.companyId, companyId),
        ),
      )
      .orderBy(desc(formPlan.createdAt));
    return results.map((r) => new FormPlan(r as unknown as FormPlan));
  }

  async findActive(
    companyId: string,
    templateId: string,
  ): Promise<FormPlan | null> {
    const [result] = await this.db
      .select()
      .from(formPlan)
      .where(
        and(
          eq(formPlan.companyId, companyId),
          eq(formPlan.formTemplateId, templateId),
          isNotNull(formPlan.effectiveFrom),
          sql`(${formPlan.effectiveUntil} IS NULL OR ${formPlan.effectiveUntil} > now())`,
        ),
      )
      .limit(1);
    return result ? new FormPlan(result as unknown as FormPlan) : null;
  }

  async listPlans(
    companyId: string,
    page: number,
    limit: number,
  ): Promise<FormPlan[]> {
    const offset = (page - 1) * limit;
    const results = await this.db
      .select()
      .from(formPlan)
      .where(eq(formPlan.companyId, companyId))
      .orderBy(desc(formPlan.createdAt))
      .limit(limit)
      .offset(offset);
    return results.map((r) => new FormPlan(r as unknown as FormPlan));
  }
}

// ==========================================
// 6. Form Plan Target Repository
// ==========================================

export class FormPlanTargetRepository implements IFormPlanTargetRepository {
  constructor(private readonly database: Database) {}

  private get db() {
    return resolveDatabase(this.database);
  }

  async findByPlanId(planId: string): Promise<FormPlanTarget[]> {
    const results = await this.db
      .select()
      .from(formPlanTarget)
      .where(eq(formPlanTarget.planId, planId));
    return results.map(
      (r) => new FormPlanTarget(r as unknown as FormPlanTarget),
    );
  }

  async create(target: CreateFormPlanTarget): Promise<FormPlanTarget> {
    const [result] = await this.db
      .insert(formPlanTarget)
      .values(target)
      .returning();
    return new FormPlanTarget(result as unknown as FormPlanTarget);
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(formPlanTarget).where(eq(formPlanTarget.id, id));
  }

  async deleteByPlanId(planId: string): Promise<void> {
    await this.db
      .delete(formPlanTarget)
      .where(eq(formPlanTarget.planId, planId));
  }
}

// ==========================================
// 7. Form Plan Period Repository
// ==========================================

export class FormPlanPeriodRepository implements IFormPlanPeriodRepository {
  constructor(private readonly database: Database) {}

  private get db() {
    return resolveDatabase(this.database);
  }

  async findByPlanId(planId: string): Promise<FormPlanPeriod[]> {
    const results = await this.db
      .select()
      .from(formPlanPeriod)
      .where(eq(formPlanPeriod.planId, planId))
      .orderBy(asc(formPlanPeriod.opensAt));
    return results.map(
      (r) => new FormPlanPeriod(r as unknown as FormPlanPeriod),
    );
  }

  async create(period: CreateFormPlanPeriod): Promise<FormPlanPeriod> {
    const [result] = await this.db
      .insert(formPlanPeriod)
      .values(period)
      .returning();
    return new FormPlanPeriod(result as unknown as FormPlanPeriod);
  }

  async deleteByPlanId(planId: string): Promise<void> {
    await this.db
      .delete(formPlanPeriod)
      .where(eq(formPlanPeriod.planId, planId));
  }
}

// ==========================================
// 8. Form Occurrence Repository
// ==========================================

export class FormOccurrenceRepository implements IFormOccurrenceRepository {
  constructor(private readonly database: Database) {}

  private get db() {
    return resolveDatabase(this.database);
  }

  async findById(id: string): Promise<FormOccurrence | null> {
    const [result] = await this.db
      .select()
      .from(formOccurrence)
      .where(eq(formOccurrence.id, id));
    return result
      ? new FormOccurrence(result as unknown as FormOccurrence)
      : null;
  }

  async findByPlanId(planId: string): Promise<FormOccurrence[]> {
    const results = await this.db
      .select()
      .from(formOccurrence)
      .where(eq(formOccurrence.planId, planId))
      .orderBy(desc(formOccurrence.opensAt));
    return results.map(
      (r) => new FormOccurrence(r as unknown as FormOccurrence),
    );
  }

  async findByOccurrenceKey(
    planId: string,
    occurrenceKey: string,
  ): Promise<FormOccurrence | null> {
    const [result] = await this.db
      .select()
      .from(formOccurrence)
      .where(
        and(
          eq(formOccurrence.planId, planId),
          eq(formOccurrence.occurrenceKey, occurrenceKey),
        ),
      )
      .limit(1);
    return result
      ? new FormOccurrence(result as unknown as FormOccurrence)
      : null;
  }

  async create(occurrence: CreateFormOccurrence): Promise<FormOccurrence> {
    const [result] = await this.db
      .insert(formOccurrence)
      .values(occurrence)
      .returning();
    return new FormOccurrence(result as unknown as FormOccurrence);
  }

  async cancel(
    id: string,
    update: UpdateFormOccurrence,
  ): Promise<FormOccurrence> {
    const [result] = await this.db
      .update(formOccurrence)
      .set({
        cancelledAt: update.cancelledAt,
        cancelledBy: update.cancelledBy,
        cancelReason: update.cancelReason,
        revision: update.revision,
      })
      .where(eq(formOccurrence.id, id))
      .returning();
    return new FormOccurrence(result as unknown as FormOccurrence);
  }

  async list(
    companyId: string,
    formTemplateId?: string,
    planId?: string,
  ): Promise<FormOccurrence[]> {
    const conditions = [eq(formOccurrence.companyId, companyId)];
    if (formTemplateId) {
      conditions.push(eq(formOccurrence.formTemplateId, formTemplateId));
    }
    if (planId) {
      conditions.push(eq(formOccurrence.planId, planId));
    }
    const results = await this.db
      .select()
      .from(formOccurrence)
      .where(and(...conditions))
      .orderBy(desc(formOccurrence.opensAt));
    return results.map(
      (r) => new FormOccurrence(r as unknown as FormOccurrence),
    );
  }
}

// ==========================================
// 9. Form Assignment Repository
// ==========================================

export class FormAssignmentRepository implements IFormAssignmentRepository {
  constructor(private readonly database: Database) {}

  private get db() {
    return resolveDatabase(this.database);
  }

  async findById(id: string): Promise<FormAssignment | null> {
    const [result] = await this.db
      .select()
      .from(formAssignment)
      .where(eq(formAssignment.id, id));
    return result
      ? new FormAssignment(result as unknown as FormAssignment)
      : null;
  }

  async findByOccurrenceId(occurrenceId: string): Promise<FormAssignment[]> {
    const results = await this.db
      .select()
      .from(formAssignment)
      .where(eq(formAssignment.occurrenceId, occurrenceId));
    return results.map(
      (r) => new FormAssignment(r as unknown as FormAssignment),
    );
  }

  async findByMemberId(
    companyId: string,
    memberId: string,
  ): Promise<FormAssignment[]> {
    const results = await this.db
      .select()
      .from(formAssignment)
      .where(
        and(
          eq(formAssignment.companyId, companyId),
          eq(formAssignment.companyMemberId, memberId),
        ),
      )
      .orderBy(desc(formAssignment.createdAt));
    return results.map(
      (r) => new FormAssignment(r as unknown as FormAssignment),
    );
  }

  async findByRoleId(
    companyId: string,
    roleId: string,
  ): Promise<FormAssignment[]> {
    const results = await this.db
      .select()
      .from(formAssignment)
      .where(
        and(
          eq(formAssignment.companyId, companyId),
          eq(formAssignment.roleId, roleId),
        ),
      )
      .orderBy(desc(formAssignment.createdAt));
    return results.map(
      (r) => new FormAssignment(r as unknown as FormAssignment),
    );
  }

  async findActiveByOccurrenceAndRole(
    occurrenceId: string,
    roleId: string,
  ): Promise<FormAssignment | null> {
    const [result] = await this.db
      .select()
      .from(formAssignment)
      .where(
        and(
          eq(formAssignment.occurrenceId, occurrenceId),
          eq(formAssignment.roleId, roleId),
          isNull(formAssignment.cancelledAt),
        ),
      )
      .limit(1);
    return result
      ? new FormAssignment(result as unknown as FormAssignment)
      : null;
  }

  async findActiveByOccurrenceAndMember(
    occurrenceId: string,
    memberId: string,
  ): Promise<FormAssignment | null> {
    const [result] = await this.db
      .select()
      .from(formAssignment)
      .where(
        and(
          eq(formAssignment.occurrenceId, occurrenceId),
          eq(formAssignment.companyMemberId, memberId),
          isNull(formAssignment.cancelledAt),
        ),
      )
      .limit(1);
    return result
      ? new FormAssignment(result as unknown as FormAssignment)
      : null;
  }

  async create(assignment: CreateFormAssignment): Promise<FormAssignment> {
    const [result] = await this.db
      .insert(formAssignment)
      .values(assignment)
      .returning();
    return new FormAssignment(result as unknown as FormAssignment);
  }

  async cancel(
    id: string,
    update: UpdateFormAssignment,
  ): Promise<FormAssignment> {
    const [result] = await this.db
      .update(formAssignment)
      .set({
        cancelledAt: update.cancelledAt,
        cancelledBy: update.cancelledBy,
        cancelReason: update.cancelReason,
        revision: update.revision,
      })
      .where(eq(formAssignment.id, id))
      .returning();
    return new FormAssignment(result as unknown as FormAssignment);
  }
}

// ==========================================
// 10. Form Submission Repository
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

  async findByAssignmentId(
    assignmentId: string,
    companyId: string,
  ): Promise<FormSubmission[]> {
    const results = await this.db
      .select()
      .from(formSubmission)
      .where(
        and(
          eq(formSubmission.assignmentId, assignmentId),
          eq(formSubmission.companyId, companyId),
        ),
      )
      .orderBy(desc(formSubmission.createdAt));
    return results.map(
      (r) => new FormSubmission(r as unknown as FormSubmission),
    );
  }

  async findByAssignmentIds(
    assignmentIds: string[],
    companyId: string,
  ): Promise<FormSubmission[]> {
    if (assignmentIds.length === 0) return [];
    const results = await this.db
      .select()
      .from(formSubmission)
      .where(
        and(
          inArray(formSubmission.assignmentId, assignmentIds),
          eq(formSubmission.companyId, companyId),
        ),
      )
      .orderBy(desc(formSubmission.createdAt));
    return results.map(
      (r) => new FormSubmission(r as unknown as FormSubmission),
    );
  }

  async findDraftByAssignmentId(
    assignmentId: string,
    companyId: string,
  ): Promise<FormSubmission | null> {
    const [result] = await this.db
      .select()
      .from(formSubmission)
      .where(
        and(
          eq(formSubmission.assignmentId, assignmentId),
          eq(formSubmission.companyId, companyId),
          isNull(formSubmission.submittedAt),
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
// 11. Form Submission Contributor Repository
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
// 12. Form Answer Repository
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
// 13. Form Answer Attachment Repository
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
// 14. Form Review Entry Repository
// ==========================================

export class FormReviewEntryRepository implements IFormReviewEntryRepository {
  constructor(private readonly database: Database) {}

  private get db() {
    return resolveDatabase(this.database);
  }

  async findBySubmissionId(submissionId: string): Promise<FormReviewEntry[]> {
    const results = await this.db
      .select()
      .from(formReviewEntry)
      .where(eq(formReviewEntry.submissionId, submissionId))
      .orderBy(asc(formReviewEntry.createdAt));
    return results.map(
      (r) => new FormReviewEntry(r as unknown as FormReviewEntry),
    );
  }

  async findHeadByTarget(
    submissionId: string,
    targetType: 'answer' | 'section' | 'final',
    targetId?: string,
  ): Promise<FormReviewEntry | null> {
    const supersededIds = await this.db
      .select({ id: formReviewEntry.supersedesEntryId })
      .from(formReviewEntry)
      .where(
        and(
          eq(formReviewEntry.submissionId, submissionId),
          isNotNull(formReviewEntry.supersedesEntryId),
        ),
      );

    const supersededSet = supersededIds
      .map((r) => r.id)
      .filter(Boolean) as string[];

    let targetCondition;
    if (targetType === 'answer') {
      targetCondition = eq(formReviewEntry.answerId, targetId!);
    } else if (targetType === 'section') {
      targetCondition = eq(formReviewEntry.sectionId, targetId!);
    } else {
      targetCondition = and(
        isNull(formReviewEntry.answerId),
        isNull(formReviewEntry.sectionId),
      );
    }

    const filters = [
      eq(formReviewEntry.submissionId, submissionId),
      targetCondition,
    ];

    if (supersededSet.length > 0) {
      filters.push(notInArray(formReviewEntry.id, supersededSet));
    }

    const [result] = await this.db
      .select()
      .from(formReviewEntry)
      .where(and(...filters))
      .limit(1);

    return result
      ? new FormReviewEntry(result as unknown as FormReviewEntry)
      : null;
  }

  async findHeadFinalBySubmissionIds(
    submissionIds: string[],
  ): Promise<FormReviewEntry[]> {
    if (submissionIds.length === 0) return [];
    const results = await this.db
      .select()
      .from(formReviewEntry)
      .where(
        and(
          inArray(formReviewEntry.submissionId, submissionIds),
          isNull(formReviewEntry.answerId),
          isNull(formReviewEntry.sectionId),
        ),
      );
    return results.map(
      (r) => new FormReviewEntry(r as unknown as FormReviewEntry),
    );
  }

  async create(entry: CreateFormReviewEntry): Promise<FormReviewEntry> {
    const [result] = await this.db
      .insert(formReviewEntry)
      .values(entry)
      .returning();
    return new FormReviewEntry(result as unknown as FormReviewEntry);
  }

  async list(companyId: string): Promise<FormReviewEntry[]> {
    const results = await this.db
      .select()
      .from(formReviewEntry)
      .where(eq(formReviewEntry.companyId, companyId))
      .orderBy(desc(formReviewEntry.createdAt));
    return results.map(
      (r) => new FormReviewEntry(r as unknown as FormReviewEntry),
    );
  }
}
