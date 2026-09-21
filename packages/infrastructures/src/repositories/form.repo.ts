import {
  and,
  asc,
  desc,
  eq,
  inArray,
  isNull,
  isNotNull,
  sql,
} from 'drizzle-orm';
import { resolveDatabase, withTransaction } from '@repo/database/transaction';
import type { Database } from '@repo/database/db';
import { Repository } from '@repo/database/repository';
import {
  formAnswer,
  formAnswerAttachment,
  formField,
  formFieldOption,
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
  formPlanRecurringSchedule,
  formSubmissionDecision,
} from '@repo/database/schema';
import {
  FormAnswer,
  FormAnswerAttachment,
  FormField,
  FormFieldOption,
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
  IFormFieldOptionRepository,
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
  CreateFormFieldOption,
  CreateFormSection,
  CreateFormSubmission,
  CreateFormSubmissionContributor,
  CreateFormTemplate,
  CreateFormVersion,
  UpdateFormAnswer,
  UpdateFormField,
  UpdateFormFieldOption,
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

/**
 * 1. Form Template Repository
 */

export class FormTemplateRepository
  extends Repository<FormTemplate, CreateFormTemplate, UpdateFormTemplate>
  implements IFormTemplateRepository
{
  constructor(db: Database) {
    super(db, formTemplate);
  }

  async findByOrganizationId(organizationId: string): Promise<FormTemplate[]> {
    const results = await this.db
      .select()
      .from(formTemplate)
      .where(eq(formTemplate.organizationId, organizationId))
      .orderBy(desc(formTemplate.createdAt));
    return results.map((r) => new FormTemplate(r as FormTemplate));
  }

  async findByIdAndOrganization(
    id: string,
    organizationId: string,
  ): Promise<FormTemplate | null> {
    const [result] = await this.db
      .select()
      .from(formTemplate)
      .where(
        and(
          eq(formTemplate.id, id),
          eq(formTemplate.organizationId, organizationId),
        ),
      );
    return result ? new FormTemplate(result as FormTemplate) : null;
  }
}

/**
 * 2. Form Version Repository
 */

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
    return results.map((r) => new FormVersion(r as FormVersion));
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
    return result ? new FormVersion(result as FormVersion) : null;
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
    return result ? new FormVersion(result as FormVersion) : null;
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
    return result ? new FormVersion(result as FormVersion) : null;
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

/**
 * 3. Form Section Repository
 */

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
    return results.map((r) => new FormSection(r as FormSection));
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

/**
 * 4. Form Field Repository
 */

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

  async findByVersionIdWithOptions(versionId: string): Promise<FormField[]> {
    const fields = await this.db
      .select()
      .from(formField)
      .where(eq(formField.formVersionId, versionId))
      .orderBy(asc(formField.sortOrder), asc(formField.createdAt));

    if (fields.length === 0) return [];

    const options = await this.db
      .select()
      .from(formFieldOption)
      .where(eq(formFieldOption.formVersionId, versionId))
      .orderBy(asc(formFieldOption.sortOrder), asc(formFieldOption.createdAt));

    const optionsByFieldId = new Map<string, FormFieldOption[]>();
    for (const opt of options) {
      const list = optionsByFieldId.get(opt.fieldId) || [];
      list.push(new FormFieldOption(opt as unknown as FormFieldOption));
      optionsByFieldId.set(opt.fieldId, list);
    }

    return fields.map((f) => {
      const opts = optionsByFieldId.get(f.id) || [];
      return new FormField({
        ...(f as unknown as FormField),
        options: opts,
      });
    });
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

/**
 * 4.1 Form Field Option Repository
 */

export class FormFieldOptionRepository
  extends Repository<
    FormFieldOption,
    CreateFormFieldOption,
    UpdateFormFieldOption
  >
  implements IFormFieldOptionRepository
{
  constructor(db: Database) {
    super(db, formFieldOption);
  }

  async findByFieldId(fieldId: string): Promise<FormFieldOption[]> {
    const results = await this.db
      .select()
      .from(formFieldOption)
      .where(eq(formFieldOption.fieldId, fieldId))
      .orderBy(asc(formFieldOption.sortOrder), asc(formFieldOption.createdAt));
    return results.map(
      (r) => new FormFieldOption(r as unknown as FormFieldOption),
    );
  }

  async findByVersionId(versionId: string): Promise<FormFieldOption[]> {
    const results = await this.db
      .select()
      .from(formFieldOption)
      .where(eq(formFieldOption.formVersionId, versionId))
      .orderBy(asc(formFieldOption.sortOrder), asc(formFieldOption.createdAt));
    return results.map(
      (r) => new FormFieldOption(r as unknown as FormFieldOption),
    );
  }

  async deleteByFieldId(fieldId: string): Promise<void> {
    await this.db
      .delete(formFieldOption)
      .where(eq(formFieldOption.fieldId, fieldId));
  }

  async replaceOptions(
    fieldId: string,
    organizationId: string,
    formVersionId: string,
    options: Array<{ label: string; value: string; sortOrder?: number }>,
  ): Promise<FormFieldOption[]> {
    await this.deleteByFieldId(fieldId);
    if (options.length === 0) return [];

    const created: FormFieldOption[] = [];
    for (let i = 0; i < options.length; i++) {
      const opt = options[i];
      if (!opt) continue;
      const res = await this.create({
        organizationId,
        formVersionId,
        fieldId,
        label: opt.label,
        value: opt.value,
        sortOrder: opt.sortOrder ?? i,
      });
      created.push(res);
    }
    return created;
  }
}

/**
 * 5. Form Plan Repository
 */

export class FormPlanRepository
  extends Repository<FormPlan, CreateFormPlan, UpdateFormPlan>
  implements IFormPlanRepository
{
  constructor(private readonly planDatabase: Database) {
    super(planDatabase, formPlan);
  }

  private async hydrate(
    rows: (typeof formPlan.$inferSelect)[],
  ): Promise<FormPlan[]> {
    if (!rows.length) return [];
    const schedules = await this.db
      .select()
      .from(formPlanRecurringSchedule)
      .where(
        inArray(
          formPlanRecurringSchedule.planId,
          rows.map((r) => r.id),
        ),
      );
    return rows.map((row) => {
      const schedule = schedules.find((s) => s.planId === row.id);
      return new FormPlan({
        ...row,
        scheduleConfig: schedule
          ? {
              frequency: schedule.frequency,
              interval: schedule.interval,
              anchorLocalDate: schedule.anchorLocalDate,
              openLocalTime: schedule.openLocalTime,
              endLocalDate: schedule.endLocalDate,
              invalidDayPolicy: schedule.invalidDayPolicy,
              dueOffset: {
                amount: schedule.dueOffsetAmount,
                unit: schedule.dueOffsetUnit,
              },
            }
          : null,
      });
    });
  }

  private async saveSchedule(
    planId: string,
    organizationId: string,
    config: CreateFormPlan['scheduleConfig'],
  ) {
    if (!config) {
      await this.db
        .delete(formPlanRecurringSchedule)
        .where(eq(formPlanRecurringSchedule.planId, planId));
      return;
    }
    const values = {
      planId,
      organizationId,
      frequency: config.frequency,
      interval: config.interval,
      anchorLocalDate: config.anchorLocalDate,
      openLocalTime: config.openLocalTime,
      endLocalDate: config.endLocalDate ?? null,
      invalidDayPolicy: config.invalidDayPolicy,
      dueOffsetAmount: config.dueOffset.amount,
      dueOffsetUnit: config.dueOffset.unit,
    };
    await this.db
      .insert(formPlanRecurringSchedule)
      .values(values)
      .onConflictDoUpdate({
        target: formPlanRecurringSchedule.planId,
        set: values,
      });
  }

  override async create(entity: CreateFormPlan): Promise<FormPlan> {
    return withTransaction(this.planDatabase, async () => {
      const { scheduleConfig, ...values } = entity;
      const [row] = await this.db.insert(formPlan).values(values).returning();
      if (!row) throw new Error('Plan insert returned no row');
      await this.saveSchedule(row.id, row.organizationId, scheduleConfig);
      return (await this.hydrate([row]))[0]!;
    });
  }

  override async update(id: string, entity: UpdateFormPlan): Promise<FormPlan> {
    return withTransaction(this.planDatabase, async () => {
      const { scheduleConfig, ...values } = entity;
      const [row] = await this.db
        .update(formPlan)
        .set(values)
        .where(this.whereActive(eq(formPlan.id, id)))
        .returning();
      if (!row) throw new Error('Plan not found');
      if (scheduleConfig !== undefined)
        await this.saveSchedule(row.id, row.organizationId, scheduleConfig);
      return (await this.hydrate([row]))[0]!;
    });
  }

  override async findById(id: string): Promise<FormPlan | null> {
    const rows = await this.db
      .select()
      .from(formPlan)
      .where(this.whereActive(eq(formPlan.id, id)));
    return (await this.hydrate(rows))[0] ?? null;
  }

  override async findAll(): Promise<FormPlan[]> {
    return this.hydrate(
      await this.db.select().from(formPlan).where(this.whereActive()),
    );
  }

  async findByTemplateId(
    templateId: string,
    organizationId: string,
  ): Promise<FormPlan[]> {
    const results = await this.db
      .select()
      .from(formPlan)
      .where(
        and(
          eq(formPlan.formTemplateId, templateId),
          eq(formPlan.organizationId, organizationId),
        ),
      )
      .orderBy(desc(formPlan.createdAt));
    return this.hydrate(results);
  }

  async findActive(
    organizationId: string,
    templateId: string,
  ): Promise<FormPlan | null> {
    const [result] = await this.db
      .select()
      .from(formPlan)
      .where(
        and(
          eq(formPlan.organizationId, organizationId),
          eq(formPlan.formTemplateId, templateId),
          isNotNull(formPlan.effectiveFrom),
          sql`(${formPlan.effectiveUntil} IS NULL OR ${formPlan.effectiveUntil} > now())`,
        ),
      )
      .limit(1);
    return result ? (await this.hydrate([result]))[0]! : null;
  }

  async listPlans(
    organizationId: string,
    page: number,
    limit: number,
  ): Promise<FormPlan[]> {
    const offset = (page - 1) * limit;
    const results = await this.db
      .select()
      .from(formPlan)
      .where(eq(formPlan.organizationId, organizationId))
      .orderBy(desc(formPlan.createdAt))
      .limit(limit)
      .offset(offset);
    return this.hydrate(results);
  }
}

/**
 * 6. Form Plan Target Repository
 */

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

/**
 * 7. Form Plan Period Repository
 */

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

/**
 * 8. Form Occurrence Repository
 */

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
    organizationId: string,
    formTemplateId?: string,
    planId?: string,
  ): Promise<FormOccurrence[]> {
    const conditions = [eq(formOccurrence.organizationId, organizationId)];
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

/**
 * 9. Form Assignment Repository
 */

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
    organizationId: string,
    memberId: string,
  ): Promise<FormAssignment[]> {
    const results = await this.db
      .select()
      .from(formAssignment)
      .where(
        and(
          eq(formAssignment.organizationId, organizationId),
          eq(formAssignment.organizationMemberId, memberId),
        ),
      )
      .orderBy(desc(formAssignment.createdAt));
    return results.map(
      (r) => new FormAssignment(r as unknown as FormAssignment),
    );
  }

  async findByRoleId(
    organizationId: string,
    roleId: string,
  ): Promise<FormAssignment[]> {
    const results = await this.db
      .select()
      .from(formAssignment)
      .where(
        and(
          eq(formAssignment.organizationId, organizationId),
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
          eq(formAssignment.organizationMemberId, memberId),
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

/**
 * 10. Form Submission Repository
 */

export class FormSubmissionRepository
  extends Repository<FormSubmission, CreateFormSubmission, UpdateFormSubmission>
  implements IFormSubmissionRepository
{
  constructor(db: Database) {
    super(db, formSubmission);
  }

  async findByOrganizationId(
    organizationId: string,
  ): Promise<FormSubmission[]> {
    const results = await this.db
      .select()
      .from(formSubmission)
      .where(eq(formSubmission.organizationId, organizationId))
      .orderBy(desc(formSubmission.createdAt));
    return results.map(
      (r) => new FormSubmission(r as unknown as FormSubmission),
    );
  }

  async findByAssignmentId(
    assignmentId: string,
    organizationId: string,
  ): Promise<FormSubmission[]> {
    const results = await this.db
      .select()
      .from(formSubmission)
      .where(
        and(
          eq(formSubmission.assignmentId, assignmentId),
          eq(formSubmission.organizationId, organizationId),
        ),
      )
      .orderBy(desc(formSubmission.createdAt));
    return results.map(
      (r) => new FormSubmission(r as unknown as FormSubmission),
    );
  }

  async findByAssignmentIds(
    assignmentIds: string[],
    organizationId: string,
  ): Promise<FormSubmission[]> {
    if (assignmentIds.length === 0) return [];
    const results = await this.db
      .select()
      .from(formSubmission)
      .where(
        and(
          inArray(formSubmission.assignmentId, assignmentIds),
          eq(formSubmission.organizationId, organizationId),
        ),
      )
      .orderBy(desc(formSubmission.createdAt));
    return results.map(
      (r) => new FormSubmission(r as unknown as FormSubmission),
    );
  }

  async findDraftByAssignmentId(
    assignmentId: string,
    organizationId: string,
  ): Promise<FormSubmission | null> {
    const [result] = await this.db
      .select()
      .from(formSubmission)
      .where(
        and(
          eq(formSubmission.assignmentId, assignmentId),
          eq(formSubmission.organizationId, organizationId),
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

/**
 * 11. Form Submission Contributor Repository
 */

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

/**
 * 12. Form Answer Repository
 */

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

/**
 * 13. Form Answer Attachment Repository
 */

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

/**
 * 14. Form Review Entry Repository
 */

/** Review history read model combines answer events and final decisions; writes use separate tables. */
export class FormReviewEntryRepository implements IFormReviewEntryRepository {
  constructor(private readonly database: Database) {}
  private get db() {
    return resolveDatabase(this.database);
  }

  private decision(
    row: typeof formSubmissionDecision.$inferSelect,
  ): FormReviewEntry {
    return new FormReviewEntry({
      ...row,
      answerId: null,
      reviewedBy: row.decidedBy,
      supersedesEntryId: null,
    });
  }

  async findBySubmissionId(submissionId: string): Promise<FormReviewEntry[]> {
    const answers = await this.db
      .select()
      .from(formReviewEntry)
      .where(eq(formReviewEntry.submissionId, submissionId));
    const decisions = await this.db
      .select()
      .from(formSubmissionDecision)
      .where(eq(formSubmissionDecision.submissionId, submissionId));
    return [
      ...answers.map((r) => new FormReviewEntry(r)),
      ...decisions.map((r) => this.decision(r)),
    ].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async findHeadByTarget(
    submissionId: string,
    targetType: 'answer' | 'final',
    targetId?: string,
  ): Promise<FormReviewEntry | null> {
    if (targetType === 'final') {
      const [row] = await this.db
        .select()
        .from(formSubmissionDecision)
        .where(eq(formSubmissionDecision.submissionId, submissionId));
      return row ? this.decision(row) : null;
    }
    const entries = await this.db
      .select()
      .from(formReviewEntry)
      .where(
        and(
          eq(formReviewEntry.submissionId, submissionId),
          eq(formReviewEntry.answerId, targetId!),
        ),
      );
    const superseded = new Set(entries.map((r) => r.supersedesEntryId));
    const row = entries.find((r) => !superseded.has(r.id));
    return row ? new FormReviewEntry(row) : null;
  }

  async findHeadFinalBySubmissionIds(
    submissionIds: string[],
  ): Promise<FormReviewEntry[]> {
    if (!submissionIds.length) return [];
    const rows = await this.db
      .select()
      .from(formSubmissionDecision)
      .where(inArray(formSubmissionDecision.submissionId, submissionIds));
    return rows.map((r) => this.decision(r));
  }

  async create(entry: CreateFormReviewEntry): Promise<FormReviewEntry> {
    if (entry.action === 'APPROVE' || entry.action === 'RETURN') {
      const [row] = await this.db
        .insert(formSubmissionDecision)
        .values({
          organizationId: entry.organizationId,
          submissionId: entry.submissionId,
          formVersionId: entry.formVersionId,
          action: entry.action,
          note: entry.note,
          decidedBy: entry.reviewedBy,
        })
        .returning();
      if (!row) throw new Error('Decision insert returned no row');
      return this.decision(row);
    }
    if (!entry.answerId) throw new Error('Answer review requires answerId');
    const [row] = await this.db
      .insert(formReviewEntry)
      .values({ ...entry, answerId: entry.answerId })
      .returning();
    if (!row) throw new Error('Review insert returned no row');
    return new FormReviewEntry(row);
  }

  async list(organizationId: string): Promise<FormReviewEntry[]> {
    const answers = await this.db
      .select()
      .from(formReviewEntry)
      .where(eq(formReviewEntry.organizationId, organizationId));
    const decisions = await this.db
      .select()
      .from(formSubmissionDecision)
      .where(eq(formSubmissionDecision.organizationId, organizationId));
    return [
      ...answers.map((r) => new FormReviewEntry(r)),
      ...decisions.map((r) => this.decision(r)),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}
