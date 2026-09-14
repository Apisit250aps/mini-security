import { sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import {
  createdAtTimestamp,
  primaryKeyUuid7,
  updatedAtTimestamp,
} from '#lib/utils';
import { company, companyMember } from './company';
import { role } from './permission';

// ==========================================
// Enums
// ==========================================

export const formVersionStatusEnum = pgEnum('form_version_status', [
  'DRAFT',
  'PUBLISHED',
  'ARCHIVED',
]);

export const formFieldTypeEnum = pgEnum('form_field_type', [
  'TEXT',
  'NUMBER',
  'SELECT',
  'BOOLEAN',
  'DATE',
  'IMAGE',
  'FILE',
]);

export const submissionReviewActionEnum = pgEnum('submission_review_action', [
  'APPROVE',
  'REJECT',
]);

// ==========================================
// 1. Form Template Table
// ==========================================

export const formTemplate = pgTable(
  'form_template',
  {
    id: primaryKeyUuid7('id'),
    companyId: uuid('company_id')
      .notNull()
      .references(() => company.id, { onDelete: 'restrict' }),
    name: text('name').notNull(),
    description: text('description'),
    isActive: boolean('is_active').default(true).notNull(),
    createdBy: uuid('created_by').notNull(),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [
    unique('form_template_id_company_id_unique').on(table.id, table.companyId),
    index('form_template_company_id_is_active_idx').on(
      table.companyId,
      table.isActive,
    ),
    foreignKey({
      columns: [table.createdBy, table.companyId],
      foreignColumns: [companyMember.id, companyMember.companyId],
      name: 'form_template_created_by_company_member_fk',
    }).onDelete('restrict'),
  ],
);

// ==========================================
// 2. Form Template Role Table
// ==========================================

export const formTemplateRole = pgTable(
  'form_template_role',
  {
    id: primaryKeyUuid7('id'),
    companyId: uuid('company_id')
      .notNull()
      .references(() => company.id, { onDelete: 'restrict' }),
    formTemplateId: uuid('form_template_id').notNull(),
    roleId: uuid('role_id')
      .notNull()
      .references(() => role.id, { onDelete: 'restrict' }),
    isEnabled: boolean('is_enabled').default(true).notNull(),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [
    unique('form_template_role_template_role_unique').on(
      table.formTemplateId,
      table.roleId,
    ),
    unique('form_template_role_template_company_role_unique').on(
      table.formTemplateId,
      table.companyId,
      table.roleId,
    ),
    index('form_template_role_company_role_idx').on(
      table.companyId,
      table.roleId,
    ),
    foreignKey({
      columns: [table.formTemplateId, table.companyId],
      foreignColumns: [formTemplate.id, formTemplate.companyId],
      name: 'form_template_role_form_template_fk',
    }).onDelete('restrict'),
  ],
);

// ==========================================
// 3. Form Version Table
// ==========================================

export const formVersion = pgTable(
  'form_version',
  {
    id: primaryKeyUuid7('id'),
    companyId: uuid('company_id')
      .notNull()
      .references(() => company.id, { onDelete: 'restrict' }),
    formTemplateId: uuid('form_template_id').notNull(),
    version: integer('version').notNull(),
    status: formVersionStatusEnum('status').default('DRAFT').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    createdBy: uuid('created_by').notNull(),
    publishedBy: uuid('published_by'),
    publishedAt: timestamp('published_at'),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [
    unique('form_version_id_company_id_unique').on(table.id, table.companyId),
    unique('form_version_id_company_template_unique').on(
      table.id,
      table.companyId,
      table.formTemplateId,
    ),
    unique('form_version_template_version_unique').on(
      table.formTemplateId,
      table.version,
    ),
    uniqueIndex('form_version_one_draft_per_template')
      .on(table.formTemplateId)
      .where(sql`status = 'DRAFT'`),
    uniqueIndex('form_version_one_published_per_template')
      .on(table.formTemplateId)
      .where(sql`status = 'PUBLISHED'`),
    index('form_version_company_status_idx').on(table.companyId, table.status),
    check(
      'form_version_publish_metadata_check',
      sql`(status = 'DRAFT' AND published_at IS NULL AND published_by IS NULL) OR (status IN ('PUBLISHED', 'ARCHIVED') AND published_at IS NOT NULL AND published_by IS NOT NULL)`,
    ),
    foreignKey({
      columns: [table.formTemplateId, table.companyId],
      foreignColumns: [formTemplate.id, formTemplate.companyId],
      name: 'form_version_form_template_fk',
    }).onDelete('restrict'),
    foreignKey({
      columns: [table.createdBy, table.companyId],
      foreignColumns: [companyMember.id, companyMember.companyId],
      name: 'form_version_created_by_company_member_fk',
    }).onDelete('restrict'),
    foreignKey({
      columns: [table.publishedBy, table.companyId],
      foreignColumns: [companyMember.id, companyMember.companyId],
      name: 'form_version_published_by_company_member_fk',
    }).onDelete('restrict'),
  ],
);

// ==========================================
// 4. Form Section Table
// ==========================================

export const formSection = pgTable(
  'form_section',
  {
    id: primaryKeyUuid7('id'),
    companyId: uuid('company_id')
      .notNull()
      .references(() => company.id, { onDelete: 'restrict' }),
    formVersionId: uuid('form_version_id').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [
    unique('form_section_id_company_version_unique').on(
      table.id,
      table.companyId,
      table.formVersionId,
    ),
    index('form_section_version_sort_idx').on(
      table.formVersionId,
      table.sortOrder,
    ),
    check('form_section_sort_order_check', sql`sort_order >= 0`),
    foreignKey({
      columns: [table.formVersionId, table.companyId],
      foreignColumns: [formVersion.id, formVersion.companyId],
      name: 'form_section_form_version_fk',
    }).onDelete('restrict'),
  ],
);

// ==========================================
// 5. Form Field Table
// ==========================================

export const formField = pgTable(
  'form_field',
  {
    id: primaryKeyUuid7('id'),
    companyId: uuid('company_id')
      .notNull()
      .references(() => company.id, { onDelete: 'restrict' }),
    formVersionId: uuid('form_version_id').notNull(),
    formSectionId: uuid('form_section_id').notNull(),
    type: formFieldTypeEnum('type').notNull(),
    label: text('label').notNull(),
    description: text('description'),
    isRequired: boolean('is_required').default(false).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    config: jsonb('config')
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [
    unique('form_field_id_company_version_unique').on(
      table.id,
      table.companyId,
      table.formVersionId,
    ),
    index('form_field_section_sort_idx').on(
      table.formSectionId,
      table.sortOrder,
    ),
    check('form_field_sort_order_check', sql`sort_order >= 0`),
    foreignKey({
      columns: [table.formSectionId, table.companyId, table.formVersionId],
      foreignColumns: [
        formSection.id,
        formSection.companyId,
        formSection.formVersionId,
      ],
      name: 'form_field_form_section_fk',
    }).onDelete('restrict'),
  ],
);

// ==========================================
// 6. Form Submission Table
// ==========================================

export const formSubmission = pgTable(
  'form_submission',
  {
    id: primaryKeyUuid7('id'),
    companyId: uuid('company_id')
      .notNull()
      .references(() => company.id, { onDelete: 'restrict' }),
    formTemplateId: uuid('form_template_id').notNull(),
    formVersionId: uuid('form_version_id').notNull(),
    roleId: uuid('role_id')
      .notNull()
      .references(() => role.id, { onDelete: 'restrict' }),
    startedBy: uuid('started_by').notNull(),
    submittedBy: uuid('submitted_by'),
    revision: integer('revision').default(1).notNull(),
    supersedesSubmissionId: uuid('supersedes_submission_id'),
    submittedAt: timestamp('submitted_at'),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [
    unique('form_submission_id_company_version_unique').on(
      table.id,
      table.companyId,
      table.formVersionId,
    ),
    unique('form_submission_id_company_version_role_unique').on(
      table.id,
      table.companyId,
      table.formVersionId,
      table.roleId,
    ),
    unique('form_submission_id_company_unique').on(table.id, table.companyId),
    unique('form_submission_supersedes_submission_id_unique').on(
      table.supersedesSubmissionId,
    ),
    index('form_submission_company_submitted_idx').on(
      table.companyId,
      table.submittedAt,
    ),
    index('form_submission_company_role_template_idx').on(
      table.companyId,
      table.roleId,
      table.formTemplateId,
    ),
    index('form_submission_company_started_by_created_idx').on(
      table.companyId,
      table.startedBy,
      table.createdAt,
    ),
    index('form_submission_company_submitted_by_created_idx').on(
      table.companyId,
      table.submittedBy,
      table.createdAt,
    ),
    index('form_submission_form_version_id_idx').on(table.formVersionId),
    check('form_submission_revision_check', sql`revision > 0`),
    check(
      'form_submission_status_time_check',
      sql`(submitted_at IS NULL) = (submitted_by IS NULL)`,
    ),
    check(
      'form_submission_time_order_check',
      sql`submitted_at IS NULL OR submitted_at >= created_at`,
    ),
    check(
      'form_submission_no_self_revision_check',
      sql`supersedes_submission_id IS NULL OR supersedes_submission_id <> id`,
    ),
    foreignKey({
      columns: [table.formVersionId, table.companyId, table.formTemplateId],
      foreignColumns: [
        formVersion.id,
        formVersion.companyId,
        formVersion.formTemplateId,
      ],
      name: 'form_submission_form_version_fk',
    }).onDelete('restrict'),
    foreignKey({
      columns: [table.formTemplateId, table.companyId, table.roleId],
      foreignColumns: [
        formTemplateRole.formTemplateId,
        formTemplateRole.companyId,
        formTemplateRole.roleId,
      ],
      name: 'form_submission_form_template_role_fk',
    }).onDelete('restrict'),
    foreignKey({
      columns: [table.startedBy, table.companyId],
      foreignColumns: [companyMember.id, companyMember.companyId],
      name: 'form_submission_started_by_member_fk',
    }).onDelete('restrict'),
    foreignKey({
      columns: [table.submittedBy, table.companyId],
      foreignColumns: [companyMember.id, companyMember.companyId],
      name: 'form_submission_submitted_by_member_fk',
    }).onDelete('restrict'),
    foreignKey({
      columns: [
        table.supersedesSubmissionId,
        table.companyId,
        table.formVersionId,
        table.roleId,
      ],
      foreignColumns: [
        table.id,
        table.companyId,
        table.formVersionId,
        table.roleId,
      ],
      name: 'form_submission_supersedes_submission_fk',
    }).onDelete('restrict'),
  ],
);

// ==========================================
// 7. Form Submission Contributor Table
// ==========================================

export const formSubmissionContributor = pgTable(
  'form_submission_contributor',
  {
    id: primaryKeyUuid7('id'),
    companyId: uuid('company_id')
      .notNull()
      .references(() => company.id, { onDelete: 'restrict' }),
    submissionId: uuid('submission_id').notNull(),
    memberId: uuid('member_id').notNull(),
    createdAt: createdAtTimestamp('created_at'),
  },
  (table) => [
    unique('form_submission_contributor_submission_member_unique').on(
      table.submissionId,
      table.memberId,
    ),
    index('form_submission_contributor_company_member_idx').on(
      table.companyId,
      table.memberId,
    ),
    foreignKey({
      columns: [table.submissionId, table.companyId],
      foreignColumns: [formSubmission.id, formSubmission.companyId],
      name: 'form_submission_contributor_submission_fk',
    }).onDelete('restrict'),
    foreignKey({
      columns: [table.memberId, table.companyId],
      foreignColumns: [companyMember.id, companyMember.companyId],
      name: 'form_submission_contributor_member_fk',
    }).onDelete('restrict'),
  ],
);

// ==========================================
// 8. Form Answer Table
// ==========================================

export const formAnswer = pgTable(
  'form_answer',
  {
    id: primaryKeyUuid7('id'),
    companyId: uuid('company_id')
      .notNull()
      .references(() => company.id, { onDelete: 'restrict' }),
    formVersionId: uuid('form_version_id').notNull(),
    submissionId: uuid('submission_id').notNull(),
    fieldId: uuid('field_id').notNull(),
    value: jsonb('value').$type<unknown>(),
    updatedBy: uuid('updated_by').notNull(),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [
    unique('form_answer_id_company_unique').on(table.id, table.companyId),
    unique('form_answer_submission_field_unique').on(
      table.submissionId,
      table.fieldId,
    ),
    index('form_answer_company_field_idx').on(table.companyId, table.fieldId),
    foreignKey({
      columns: [table.submissionId, table.companyId, table.formVersionId],
      foreignColumns: [
        formSubmission.id,
        formSubmission.companyId,
        formSubmission.formVersionId,
      ],
      name: 'form_answer_submission_fk',
    }).onDelete('restrict'),
    foreignKey({
      columns: [table.fieldId, table.companyId, table.formVersionId],
      foreignColumns: [
        formField.id,
        formField.companyId,
        formField.formVersionId,
      ],
      name: 'form_answer_field_fk',
    }).onDelete('restrict'),
    foreignKey({
      columns: [table.updatedBy, table.companyId],
      foreignColumns: [companyMember.id, companyMember.companyId],
      name: 'form_answer_updated_by_member_fk',
    }).onDelete('restrict'),
  ],
);

// ==========================================
// 9. Form Answer Attachment Table
// ==========================================

export const formAnswerAttachment = pgTable(
  'form_answer_attachment',
  {
    id: primaryKeyUuid7('id'),
    companyId: uuid('company_id')
      .notNull()
      .references(() => company.id, { onDelete: 'restrict' }),
    answerId: uuid('answer_id').notNull(),
    storageKey: text('storage_key').notNull(),
    originalName: text('original_name').notNull(),
    mimeType: text('mime_type').notNull(),
    sizeBytes: bigint('size_bytes', { mode: 'number' }).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    uploadedBy: uuid('uploaded_by').notNull(),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [
    unique('form_answer_attachment_answer_key_unique').on(
      table.answerId,
      table.storageKey,
    ),
    index('form_answer_attachment_answer_sort_idx').on(
      table.answerId,
      table.sortOrder,
    ),
    index('form_answer_attachment_company_key_idx').on(
      table.companyId,
      table.storageKey,
    ),
    check('form_answer_attachment_size_check', sql`size_bytes > 0`),
    check('form_answer_attachment_sort_order_check', sql`sort_order >= 0`),
    foreignKey({
      columns: [table.answerId, table.companyId],
      foreignColumns: [formAnswer.id, formAnswer.companyId],
      name: 'form_answer_attachment_answer_fk',
    }).onDelete('restrict'),
    foreignKey({
      columns: [table.uploadedBy, table.companyId],
      foreignColumns: [companyMember.id, companyMember.companyId],
      name: 'form_answer_attachment_uploaded_by_member_fk',
    }).onDelete('restrict'),
  ],
);

// ==========================================
// 10. Submission Review Table
// ==========================================

export const submissionReview = pgTable(
  'submission_review',
  {
    id: primaryKeyUuid7('id'),
    companyId: uuid('company_id')
      .notNull()
      .references(() => company.id, { onDelete: 'restrict' }),
    submissionId: uuid('submission_id').notNull(),
    reviewedBy: uuid('reviewed_by').notNull(),
    action: submissionReviewActionEnum('action').notNull(),
    note: text('note'),
    createdAt: createdAtTimestamp('created_at'),
  },
  (table) => [
    unique('submission_review_submission_id_unique').on(table.submissionId),
    index('submission_review_company_reviewer_created_idx').on(
      table.companyId,
      table.reviewedBy,
      table.createdAt,
    ),
    check(
      'submission_review_reject_note_check',
      sql`action <> 'REJECT' OR (note IS NOT NULL AND length(trim(note)) > 0)`,
    ),
    foreignKey({
      columns: [table.submissionId, table.companyId],
      foreignColumns: [formSubmission.id, formSubmission.companyId],
      name: 'submission_review_submission_fk',
    }).onDelete('restrict'),
    foreignKey({
      columns: [table.reviewedBy, table.companyId],
      foreignColumns: [companyMember.id, companyMember.companyId],
      name: 'submission_review_reviewed_by_member_fk',
    }).onDelete('restrict'),
  ],
);
