import { sql } from 'drizzle-orm';
import {
  bigint, boolean, check, foreignKey, index, integer, jsonb, pgEnum, pgTable, text, timestamp, unique, uniqueIndex, uuid,
} from 'drizzle-orm/pg-core';
import { createdAtTimestamp, primaryKeyUuid7, updatedAtTimestamp } from '#lib/utils';
import { company, companyMember } from './company';
import { role } from './permission';

// Enums
export const formVersionStatusEnum = pgEnum('form_version_status', ['DRAFT', 'PUBLISHED', 'ARCHIVED']);
export const formFieldTypeEnum = pgEnum('form_field_type', ['TEXT', 'NUMBER', 'SELECT', 'BOOLEAN', 'DATE', 'IMAGE', 'FILE']);
export const formScheduleKindEnum = pgEnum('form_schedule_kind', ['RECURRING', 'EXPLICIT']);
export const formReviewModeEnum = pgEnum('form_review_mode', ['NONE', 'OVERALL', 'ALL_SECTIONS', 'ALL_ANSWERS']);
export const formRoleDistributionEnum = pgEnum('form_role_distribution', ['SHARED', 'PER_MEMBER']);
export const formLatePolicyEnum = pgEnum('form_late_policy', ['ALLOW', 'DENY']);
export const formMissedPolicyEnum = pgEnum('form_missed_policy', ['SKIP', 'CATCH_UP']);
export const formReviewActionEnum = pgEnum('form_review_action', ['PASS', 'NEEDS_CHANGES', 'APPROVE', 'RETURN']);

export const formTemplate = pgTable('form_template', {
  id: primaryKeyUuid7('id'),
  companyId: uuid('company_id').notNull().references(() => company.id, { onDelete: 'restrict' }),
  name: text('name').notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdBy: uuid('created_by').notNull(),
  createdAt: createdAtTimestamp('created_at'),
  updatedAt: updatedAtTimestamp('updated_at'),
}, (table) => [
  unique('form_template_id_company_id_unique').on(table.id, table.companyId),
  index('form_template_company_id_is_active_idx').on(table.companyId, table.isActive),
  foreignKey({ columns: [table.createdBy, table.companyId], foreignColumns: [companyMember.id, companyMember.companyId], name: 'form_template_created_by_company_member_fk' }).onDelete('restrict'),
]);

export const formVersion = pgTable('form_version', {
  id: primaryKeyUuid7('id'),
  companyId: uuid('company_id').notNull().references(() => company.id, { onDelete: 'restrict' }),
  formTemplateId: uuid('form_template_id').notNull(),
  version: integer('version').notNull(),
  status: formVersionStatusEnum('status').default('DRAFT').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  createdBy: uuid('created_by').notNull(),
  publishedBy: uuid('published_by'),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: createdAtTimestamp('created_at'),
  updatedAt: updatedAtTimestamp('updated_at'),
}, (table) => [
  unique('form_version_id_company_id_unique').on(table.id, table.companyId),
  unique('form_version_id_company_template_unique').on(table.id, table.companyId, table.formTemplateId),
  unique('form_version_template_version_unique').on(table.formTemplateId, table.version),
  uniqueIndex('form_one_draft_version').on(table.formTemplateId).where(sql`status = 'DRAFT'`),
  uniqueIndex('form_one_published_version').on(table.formTemplateId).where(sql`status = 'PUBLISHED'`),
  index('form_version_company_status_idx').on(table.companyId, table.status),
  check('form_version_publish_metadata_check', sql`(status = 'DRAFT' AND published_at IS NULL AND published_by IS NULL) OR (status IN ('PUBLISHED', 'ARCHIVED') AND published_at IS NOT NULL AND published_by IS NOT NULL)`),
  foreignKey({ columns: [table.formTemplateId, table.companyId], foreignColumns: [formTemplate.id, formTemplate.companyId], name: 'form_version_form_template_fk' }).onDelete('restrict'),
  foreignKey({ columns: [table.createdBy, table.companyId], foreignColumns: [companyMember.id, companyMember.companyId], name: 'form_version_created_by_company_member_fk' }).onDelete('restrict'),
  foreignKey({ columns: [table.publishedBy, table.companyId], foreignColumns: [companyMember.id, companyMember.companyId], name: 'form_version_published_by_company_member_fk' }).onDelete('restrict'),
]);

export const formSection = pgTable('form_section', {
  id: primaryKeyUuid7('id'),
  companyId: uuid('company_id').notNull().references(() => company.id, { onDelete: 'restrict' }),
  formVersionId: uuid('form_version_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: createdAtTimestamp('created_at'),
  updatedAt: updatedAtTimestamp('updated_at'),
}, (table) => [
  unique('form_section_id_company_version_unique').on(table.id, table.companyId, table.formVersionId),
  index('form_section_version_sort_idx').on(table.formVersionId, table.sortOrder),
  check('form_section_sort_order_check', sql`sort_order >= 0`),
  foreignKey({ columns: [table.formVersionId, table.companyId], foreignColumns: [formVersion.id, formVersion.companyId], name: 'form_section_form_version_fk' }).onDelete('restrict'),
]);

export const formField = pgTable('form_field', {
  id: primaryKeyUuid7('id'),
  companyId: uuid('company_id').notNull().references(() => company.id, { onDelete: 'restrict' }),
  formVersionId: uuid('form_version_id').notNull(),
  formSectionId: uuid('form_section_id').notNull(),
  type: formFieldTypeEnum('type').notNull(),
  label: text('label').notNull(),
  description: text('description'),
  isRequired: boolean('is_required').default(false).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  config: jsonb('config').$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: createdAtTimestamp('created_at'),
  updatedAt: updatedAtTimestamp('updated_at'),
}, (table) => [
  unique('form_field_id_company_version_unique').on(table.id, table.companyId, table.formVersionId),
  index('form_field_section_sort_idx').on(table.formSectionId, table.sortOrder),
  check('form_field_sort_order_check', sql`sort_order >= 0`),
  foreignKey({ columns: [table.formSectionId, table.companyId, table.formVersionId], foreignColumns: [formSection.id, formSection.companyId, formSection.formVersionId], name: 'form_field_form_section_fk' }).onDelete('restrict'),
]);

export const formPlan = pgTable('form_plan', {
  id: primaryKeyUuid7('id'),
  companyId: uuid('company_id').notNull().references(() => company.id, { onDelete: 'restrict' }),
  formTemplateId: uuid('form_template_id').notNull(),
  supersedesPlanId: uuid('supersedes_plan_id'),
  name: text('name').notNull(),
  scheduleKind: formScheduleKindEnum('schedule_kind').notNull(),
  scheduleConfig: jsonb('schedule_config').$type<Record<string, unknown>>(),
  timezone: text('timezone').notNull(),
  fixedVersionId: uuid('fixed_version_id'),
  reviewMode: formReviewModeEnum('review_mode').default('OVERALL').notNull(),
  latePolicy: formLatePolicyEnum('late_policy').default('DENY').notNull(),
  missedPolicy: formMissedPolicyEnum('missed_policy').default('SKIP').notNull(),
  effectiveFrom: timestamp('effective_from', { withTimezone: true }),
  effectiveUntil: timestamp('effective_until', { withTimezone: true }),
  createdBy: uuid('created_by').notNull(),
  closedBy: uuid('closed_by'),
  revision: integer('revision').default(1).notNull(),
  createdAt: createdAtTimestamp('created_at'),
  updatedAt: updatedAtTimestamp('updated_at'),
}, (table) => [
  unique('form_plan_id_company_unique').on(table.id, table.companyId),
  unique('form_plan_id_company_template_unique').on(table.id, table.companyId, table.formTemplateId),
  unique('form_plan_supersedes_plan_id_unique').on(table.supersedesPlanId),
  index('form_plan_company_effective_idx').on(table.companyId, table.effectiveFrom, table.effectiveUntil),
  check('form_plan_schedule_check', sql`(schedule_kind = 'RECURRING' AND schedule_config IS NOT NULL AND jsonb_typeof(schedule_config) = 'object') OR (schedule_kind = 'EXPLICIT' AND schedule_config IS NULL)`),
  check('form_plan_effective_check', sql`effective_until IS NULL OR (effective_from IS NOT NULL AND effective_until > effective_from)`),
  check('form_plan_no_self_check', sql`supersedes_plan_id IS NULL OR supersedes_plan_id <> id`),
  check('form_plan_closed_actor_check', sql`closed_by IS NULL OR effective_until IS NOT NULL`),
  foreignKey({ columns: [table.formTemplateId, table.companyId], foreignColumns: [formTemplate.id, formTemplate.companyId], name: 'form_plan_form_template_fk' }).onDelete('restrict'),
  foreignKey({ columns: [table.supersedesPlanId, table.companyId, table.formTemplateId], foreignColumns: [table.id, table.companyId, table.formTemplateId], name: 'form_plan_supersedes_plan_fk' }).onDelete('restrict'),
  foreignKey({ columns: [table.fixedVersionId, table.companyId, table.formTemplateId], foreignColumns: [formVersion.id, formVersion.companyId, formVersion.formTemplateId], name: 'form_plan_fixed_version_fk' }).onDelete('restrict'),
  foreignKey({ columns: [table.createdBy, table.companyId], foreignColumns: [companyMember.id, companyMember.companyId], name: 'form_plan_created_by_fk' }).onDelete('restrict'),
  foreignKey({ columns: [table.closedBy, table.companyId], foreignColumns: [companyMember.id, companyMember.companyId], name: 'form_plan_closed_by_fk' }).onDelete('restrict'),
]);

export const formPlanTarget = pgTable('form_plan_target', {
  id: primaryKeyUuid7('id'),
  companyId: uuid('company_id').notNull().references(() => company.id, { onDelete: 'restrict' }),
  planId: uuid('plan_id').notNull(),
  roleId: uuid('role_id').references(() => role.id, { onDelete: 'restrict' }),
  companyMemberId: uuid('company_member_id'),
  roleDistribution: formRoleDistributionEnum('role_distribution'),
  createdAt: createdAtTimestamp('created_at'),
}, (table) => [
  unique('form_plan_target_plan_role_unique').on(table.planId, table.roleId),
  unique('form_plan_target_plan_member_unique').on(table.planId, table.companyMemberId),
  check('form_plan_target_xor_check', sql`(role_id IS NOT NULL AND company_member_id IS NULL AND role_distribution IS NOT NULL) OR (role_id IS NULL AND company_member_id IS NOT NULL AND role_distribution IS NULL)`),
  foreignKey({ columns: [table.planId, table.companyId], foreignColumns: [formPlan.id, formPlan.companyId], name: 'form_plan_target_plan_fk' }).onDelete('restrict'),
  foreignKey({ columns: [table.companyMemberId, table.companyId], foreignColumns: [companyMember.id, companyMember.companyId], name: 'form_plan_target_company_member_fk' }).onDelete('restrict'),
]);

export const formPlanPeriod = pgTable('form_plan_period', {
  id: primaryKeyUuid7('id'),
  companyId: uuid('company_id').notNull().references(() => company.id, { onDelete: 'restrict' }),
  planId: uuid('plan_id').notNull(),
  opensAt: timestamp('opens_at', { withTimezone: true }).notNull(),
  dueAt: timestamp('due_at', { withTimezone: true }).notNull(),
  createdAt: createdAtTimestamp('created_at'),
}, (table) => [
  unique('form_plan_period_id_company_plan_unique').on(table.id, table.companyId, table.planId),
  unique('form_plan_period_plan_opens_due_unique').on(table.planId, table.opensAt, table.dueAt),
  check('form_plan_period_time_check', sql`due_at > opens_at`),
  foreignKey({ columns: [table.planId, table.companyId], foreignColumns: [formPlan.id, formPlan.companyId], name: 'form_plan_period_plan_fk' }).onDelete('restrict'),
]);

export const formOccurrence = pgTable('form_occurrence', {
  id: primaryKeyUuid7('id'),
  companyId: uuid('company_id').notNull().references(() => company.id, { onDelete: 'restrict' }),
  planId: uuid('plan_id').notNull(),
  formTemplateId: uuid('form_template_id').notNull(),
  formVersionId: uuid('form_version_id').notNull(),
  periodId: uuid('period_id'),
  occurrenceKey: text('occurrence_key').notNull(),
  opensAt: timestamp('opens_at', { withTimezone: true }).notNull(),
  dueAt: timestamp('due_at', { withTimezone: true }).notNull(),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  cancelledBy: uuid('cancelled_by'),
  cancelReason: text('cancel_reason'),
  revision: integer('revision').default(1).notNull(),
  createdAt: createdAtTimestamp('created_at'),
}, (table) => [
  unique('form_occurrence_id_company_unique').on(table.id, table.companyId),
  unique('form_occurrence_id_company_version_unique').on(table.id, table.companyId, table.formVersionId),
  unique('form_occurrence_plan_key_unique').on(table.planId, table.occurrenceKey),
  unique('form_occurrence_plan_period_unique').on(table.planId, table.periodId),
  index('form_occurrence_company_opens_idx').on(table.companyId, table.opensAt),
  check('form_occurrence_time_check', sql`due_at > opens_at`),
  check('form_occurrence_cancel_check', sql`(cancelled_at IS NULL AND cancelled_by IS NULL AND cancel_reason IS NULL) OR (cancelled_at IS NOT NULL AND cancelled_by IS NOT NULL AND cancel_reason IS NOT NULL AND length(trim(cancel_reason)) > 0)`),
  foreignKey({ columns: [table.planId, table.companyId, table.formTemplateId], foreignColumns: [formPlan.id, formPlan.companyId, formPlan.formTemplateId], name: 'form_occurrence_plan_fk' }).onDelete('restrict'),
  foreignKey({ columns: [table.formVersionId, table.companyId, table.formTemplateId], foreignColumns: [formVersion.id, formVersion.companyId, formVersion.formTemplateId], name: 'form_occurrence_form_version_fk' }).onDelete('restrict'),
  foreignKey({ columns: [table.periodId, table.companyId, table.planId], foreignColumns: [formPlanPeriod.id, formPlanPeriod.companyId, formPlanPeriod.planId], name: 'form_occurrence_period_fk' }).onDelete('restrict'),
  foreignKey({ columns: [table.cancelledBy, table.companyId], foreignColumns: [companyMember.id, companyMember.companyId], name: 'form_occurrence_cancelled_by_fk' }).onDelete('restrict'),
]);

export const formAssignment = pgTable('form_assignment', {
  id: primaryKeyUuid7('id'),
  companyId: uuid('company_id').notNull().references(() => company.id, { onDelete: 'restrict' }),
  occurrenceId: uuid('occurrence_id').notNull(),
  formVersionId: uuid('form_version_id').notNull(),
  roleId: uuid('role_id').references(() => role.id, { onDelete: 'restrict' }),
  companyMemberId: uuid('company_member_id'),
  replacesAssignmentId: uuid('replaces_assignment_id'),
  assignedBy: uuid('assigned_by'),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  cancelledBy: uuid('cancelled_by'),
  cancelReason: text('cancel_reason'),
  revision: integer('revision').default(1).notNull(),
  createdAt: createdAtTimestamp('created_at'),
}, (table) => [
  unique('form_assignment_id_company_version_unique').on(table.id, table.companyId, table.formVersionId),
  unique('form_assignment_id_company_occurrence_unique').on(table.id, table.companyId, table.occurrenceId),
  unique('form_assignment_replaces_assignment_id_unique').on(table.replacesAssignmentId),
  uniqueIndex('form_active_role_assignment').on(table.occurrenceId, table.roleId).where(sql`cancelled_at IS NULL AND role_id IS NOT NULL`),
  uniqueIndex('form_active_member_assignment').on(table.occurrenceId, table.companyMemberId).where(sql`cancelled_at IS NULL AND company_member_id IS NOT NULL`),
  index('form_assignment_company_member_created_idx').on(table.companyId, table.companyMemberId, table.createdAt),
  index('form_assignment_company_role_created_idx').on(table.companyId, table.roleId, table.createdAt),
  check('form_assignment_target_check', sql`num_nonnulls(role_id, company_member_id) = 1`),
  check('form_assignment_no_self_check', sql`replaces_assignment_id IS NULL OR replaces_assignment_id <> id`),
  check('form_assignment_cancel_check', sql`(cancelled_at IS NULL AND cancelled_by IS NULL AND cancel_reason IS NULL) OR (cancelled_at IS NOT NULL AND cancelled_by IS NOT NULL AND cancel_reason IS NOT NULL AND length(trim(cancel_reason)) > 0)`),
  foreignKey({ columns: [table.occurrenceId, table.companyId, table.formVersionId], foreignColumns: [formOccurrence.id, formOccurrence.companyId, formOccurrence.formVersionId], name: 'form_assignment_occurrence_fk' }).onDelete('restrict'),
  foreignKey({ columns: [table.companyMemberId, table.companyId], foreignColumns: [companyMember.id, companyMember.companyId], name: 'form_assignment_company_member_fk' }).onDelete('restrict'),
  foreignKey({ columns: [table.replacesAssignmentId, table.companyId, table.occurrenceId], foreignColumns: [table.id, table.companyId, table.occurrenceId], name: 'form_assignment_replaces_fk' }).onDelete('restrict'),
  foreignKey({ columns: [table.assignedBy, table.companyId], foreignColumns: [companyMember.id, companyMember.companyId], name: 'form_assignment_assigned_by_fk' }).onDelete('restrict'),
  foreignKey({ columns: [table.cancelledBy, table.companyId], foreignColumns: [companyMember.id, companyMember.companyId], name: 'form_assignment_cancelled_by_fk' }).onDelete('restrict'),
]);

export const formSubmission = pgTable('form_submission', {
  id: primaryKeyUuid7('id'),
  companyId: uuid('company_id').notNull().references(() => company.id, { onDelete: 'restrict' }),
  assignmentId: uuid('assignment_id').notNull(),
  formVersionId: uuid('form_version_id').notNull(),
  startedBy: uuid('started_by').notNull(),
  submittedBy: uuid('submitted_by'),
  revision: integer('revision').default(1).notNull(),
  supersedesSubmissionId: uuid('supersedes_submission_id'),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  createdAt: createdAtTimestamp('created_at'),
  updatedAt: updatedAtTimestamp('updated_at'),
}, (table) => [
  unique('form_submission_id_company_version_unique').on(table.id, table.companyId, table.formVersionId),
  unique('form_submission_id_company_version_assignment_unique').on(table.id, table.companyId, table.formVersionId, table.assignmentId),
  unique('form_submission_id_company_unique').on(table.id, table.companyId),
  unique('form_submission_supersedes_submission_id_unique').on(table.supersedesSubmissionId),
  uniqueIndex('form_one_root_submission').on(table.assignmentId).where(sql`supersedes_submission_id IS NULL`),
  index('form_submission_company_submitted_idx').on(table.companyId, table.submittedAt),
  index('form_submission_company_assignment_idx').on(table.companyId, table.assignmentId),
  index('form_submission_company_started_by_created_idx').on(table.companyId, table.startedBy, table.createdAt),
  index('form_submission_company_submitted_by_created_idx').on(table.companyId, table.submittedBy, table.createdAt),
  index('form_submission_form_version_id_idx').on(table.formVersionId),
  check('form_submission_revision_check', sql`revision > 0`),
  check('form_submission_status_time_check', sql`(submitted_at IS NULL) = (submitted_by IS NULL)`),
  check('form_submission_time_order_check', sql`submitted_at IS NULL OR submitted_at >= created_at`),
  check('form_submission_no_self_revision_check', sql`supersedes_submission_id IS NULL OR supersedes_submission_id <> id`),
  foreignKey({ columns: [table.assignmentId, table.companyId, table.formVersionId], foreignColumns: [formAssignment.id, formAssignment.companyId, formAssignment.formVersionId], name: 'form_submission_assignment_fk' }).onDelete('restrict'),
  foreignKey({ columns: [table.startedBy, table.companyId], foreignColumns: [companyMember.id, companyMember.companyId], name: 'form_submission_started_by_member_fk' }).onDelete('restrict'),
  foreignKey({ columns: [table.submittedBy, table.companyId], foreignColumns: [companyMember.id, companyMember.companyId], name: 'form_submission_submitted_by_member_fk' }).onDelete('restrict'),
  foreignKey({ columns: [table.supersedesSubmissionId, table.companyId, table.formVersionId, table.assignmentId], foreignColumns: [table.id, table.companyId, table.formVersionId, table.assignmentId], name: 'form_submission_supersedes_submission_fk' }).onDelete('restrict'),
]);

export const formSubmissionContributor = pgTable('form_submission_contributor', {
  id: primaryKeyUuid7('id'),
  companyId: uuid('company_id').notNull().references(() => company.id, { onDelete: 'restrict' }),
  submissionId: uuid('submission_id').notNull(),
  memberId: uuid('member_id').notNull(),
  createdAt: createdAtTimestamp('created_at'),
}, (table) => [
  unique('form_submission_contributor_submission_member_unique').on(table.submissionId, table.memberId),
  index('form_submission_contributor_company_member_idx').on(table.companyId, table.memberId),
  foreignKey({ columns: [table.submissionId, table.companyId], foreignColumns: [formSubmission.id, formSubmission.companyId], name: 'form_submission_contributor_submission_fk' }).onDelete('restrict'),
  foreignKey({ columns: [table.memberId, table.companyId], foreignColumns: [companyMember.id, companyMember.companyId], name: 'form_submission_contributor_member_fk' }).onDelete('restrict'),
]);

export const formAnswer = pgTable('form_answer', {
  id: primaryKeyUuid7('id'),
  companyId: uuid('company_id').notNull().references(() => company.id, { onDelete: 'restrict' }),
  formVersionId: uuid('form_version_id').notNull(),
  submissionId: uuid('submission_id').notNull(),
  fieldId: uuid('field_id').notNull(),
  value: jsonb('value').$type<unknown>(),
  updatedBy: uuid('updated_by').notNull(),
  createdAt: createdAtTimestamp('created_at'),
  updatedAt: updatedAtTimestamp('updated_at'),
}, (table) => [
  unique('form_answer_id_company_unique').on(table.id, table.companyId),
  unique('form_answer_id_company_submission_unique').on(table.id, table.companyId, table.submissionId),
  unique('form_answer_submission_field_unique').on(table.submissionId, table.fieldId),
  index('form_answer_company_field_idx').on(table.companyId, table.fieldId),
  foreignKey({ columns: [table.submissionId, table.companyId, table.formVersionId], foreignColumns: [formSubmission.id, formSubmission.companyId, formSubmission.formVersionId], name: 'form_answer_submission_fk' }).onDelete('restrict'),
  foreignKey({ columns: [table.fieldId, table.companyId, table.formVersionId], foreignColumns: [formField.id, formField.companyId, formField.formVersionId], name: 'form_answer_field_fk' }).onDelete('restrict'),
  foreignKey({ columns: [table.updatedBy, table.companyId], foreignColumns: [companyMember.id, companyMember.companyId], name: 'form_answer_updated_by_member_fk' }).onDelete('restrict'),
]);

export const formAnswerAttachment = pgTable('form_answer_attachment', {
  id: primaryKeyUuid7('id'),
  companyId: uuid('company_id').notNull().references(() => company.id, { onDelete: 'restrict' }),
  answerId: uuid('answer_id').notNull(),
  storageKey: text('storage_key').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  sizeBytes: bigint('size_bytes', { mode: 'number' }).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  uploadedBy: uuid('uploaded_by').notNull(),
  createdAt: createdAtTimestamp('created_at'),
  updatedAt: updatedAtTimestamp('updated_at'),
}, (table) => [
  unique('form_answer_attachment_answer_key_unique').on(table.answerId, table.storageKey),
  index('form_answer_attachment_answer_sort_idx').on(table.answerId, table.sortOrder),
  index('form_answer_attachment_company_key_idx').on(table.companyId, table.storageKey),
  check('form_answer_attachment_size_check', sql`size_bytes > 0`),
  check('form_answer_attachment_sort_order_check', sql`sort_order >= 0`),
  foreignKey({ columns: [table.answerId, table.companyId], foreignColumns: [formAnswer.id, formAnswer.companyId], name: 'form_answer_attachment_answer_fk' }).onDelete('restrict'),
  foreignKey({ columns: [table.uploadedBy, table.companyId], foreignColumns: [companyMember.id, companyMember.companyId], name: 'form_answer_attachment_uploaded_by_member_fk' }).onDelete('restrict'),
]);

export const formReviewEntry = pgTable('form_review_entry', {
  id: primaryKeyUuid7('id'),
  companyId: uuid('company_id').notNull().references(() => company.id, { onDelete: 'restrict' }),
  submissionId: uuid('submission_id').notNull(),
  formVersionId: uuid('form_version_id').notNull(),
  answerId: uuid('answer_id'),
  sectionId: uuid('section_id'),
  action: formReviewActionEnum('action').notNull(),
  note: text('note'),
  reviewedBy: uuid('reviewed_by').notNull(),
  supersedesEntryId: uuid('supersedes_entry_id'),
  createdAt: createdAtTimestamp('created_at'),
}, (table) => [
  unique('form_review_entry_id_company_submission_unique').on(table.id, table.companyId, table.submissionId),
  unique('form_review_entry_supersedes_entry_id_unique').on(table.supersedesEntryId),
  uniqueIndex('form_one_answer_review_root').on(table.submissionId, table.answerId).where(sql`answer_id IS NOT NULL AND supersedes_entry_id IS NULL`),
  uniqueIndex('form_one_section_review_root').on(table.submissionId, table.sectionId).where(sql`section_id IS NOT NULL AND supersedes_entry_id IS NULL`),
  uniqueIndex('form_one_final_review').on(table.submissionId).where(sql`answer_id IS NULL AND section_id IS NULL`),
  index('form_review_entry_submission_answer_created_idx').on(table.submissionId, table.answerId, table.createdAt),
  index('form_review_entry_submission_section_created_idx').on(table.submissionId, table.sectionId, table.createdAt),
  index('form_review_entry_company_reviewer_created_idx').on(table.companyId, table.reviewedBy, table.createdAt),
  check('form_review_target_action_check', sql`(num_nonnulls(answer_id, section_id) = 1 AND action IN ('PASS', 'NEEDS_CHANGES')) OR (answer_id IS NULL AND section_id IS NULL AND action IN ('APPROVE', 'RETURN') AND supersedes_entry_id IS NULL)`),
  check('form_review_note_check', sql`action NOT IN ('NEEDS_CHANGES', 'RETURN') OR (note IS NOT NULL AND length(trim(note)) > 0)`),
  check('form_review_no_self_check', sql`supersedes_entry_id IS NULL OR supersedes_entry_id <> id`),
  foreignKey({ columns: [table.submissionId, table.companyId, table.formVersionId], foreignColumns: [formSubmission.id, formSubmission.companyId, formSubmission.formVersionId], name: 'form_review_entry_submission_fk' }).onDelete('restrict'),
  foreignKey({ columns: [table.answerId, table.companyId, table.submissionId], foreignColumns: [formAnswer.id, formAnswer.companyId, formAnswer.submissionId], name: 'form_review_entry_answer_fk' }).onDelete('restrict'),
  foreignKey({ columns: [table.sectionId, table.companyId, table.formVersionId], foreignColumns: [formSection.id, formSection.companyId, formSection.formVersionId], name: 'form_review_entry_section_fk' }).onDelete('restrict'),
  foreignKey({ columns: [table.supersedesEntryId, table.companyId, table.submissionId], foreignColumns: [table.id, table.companyId, table.submissionId], name: 'form_review_entry_supersedes_fk' }).onDelete('restrict'),
  foreignKey({ columns: [table.reviewedBy, table.companyId], foreignColumns: [companyMember.id, companyMember.companyId], name: 'form_review_entry_reviewed_by_member_fk' }).onDelete('restrict'),
]);
