import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
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

export const formSubmissionStatusEnum = pgEnum('form_submission_status', [
  'DRAFT',
  'SUBMITTED',
  'APPROVED',
  'REJECTED',
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
    createdBy: uuid('created_by')
      .notNull()
      .references(() => companyMember.id, { onDelete: 'restrict' }),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [
    unique('form_template_id_company_id_unique').on(table.id, table.companyId),
    index('form_template_company_id_is_active_idx').on(
      table.companyId,
      table.isActive,
    ),
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
    formTemplateId: uuid('form_template_id')
      .notNull()
      .references(() => formTemplate.id, { onDelete: 'restrict' }),
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
    formTemplateId: uuid('form_template_id')
      .notNull()
      .references(() => formTemplate.id, { onDelete: 'restrict' }),
    version: integer('version').notNull(),
    status: formVersionStatusEnum('status').default('DRAFT').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => companyMember.id, { onDelete: 'restrict' }),
    publishedBy: uuid('published_by').references(() => companyMember.id, {
      onDelete: 'restrict',
    }),
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
    index('form_version_company_status_idx').on(table.companyId, table.status),
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
    formVersionId: uuid('form_version_id')
      .notNull()
      .references(() => formVersion.id, { onDelete: 'restrict' }),
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
    formVersionId: uuid('form_version_id')
      .notNull()
      .references(() => formVersion.id, { onDelete: 'restrict' }),
    formSectionId: uuid('form_section_id')
      .notNull()
      .references(() => formSection.id, { onDelete: 'restrict' }),
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
    formTemplateId: uuid('form_template_id')
      .notNull()
      .references(() => formTemplate.id, { onDelete: 'restrict' }),
    formVersionId: uuid('form_version_id')
      .notNull()
      .references(() => formVersion.id, { onDelete: 'restrict' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => role.id, { onDelete: 'restrict' }),
    startedBy: uuid('started_by')
      .notNull()
      .references(() => companyMember.id, { onDelete: 'restrict' }),
    submittedBy: uuid('submitted_by').references(() => companyMember.id, {
      onDelete: 'restrict',
    }),
    revision: integer('revision').default(1).notNull(),
    supersedesSubmissionId: uuid('supersedes_submission_id'),
    status: formSubmissionStatusEnum('status').default('DRAFT').notNull(),
    startedAt: timestamp('started_at').defaultNow().notNull(),
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
    index('form_submission_company_status_submitted_idx').on(
      table.companyId,
      table.status,
      table.submittedAt,
    ),
    index('form_submission_company_role_template_status_idx').on(
      table.companyId,
      table.roleId,
      table.formTemplateId,
      table.status,
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
    submissionId: uuid('submission_id')
      .notNull()
      .references(() => formSubmission.id, { onDelete: 'restrict' }),
    memberId: uuid('member_id')
      .notNull()
      .references(() => companyMember.id, { onDelete: 'restrict' }),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
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
    formVersionId: uuid('form_version_id')
      .notNull()
      .references(() => formVersion.id, { onDelete: 'restrict' }),
    submissionId: uuid('submission_id')
      .notNull()
      .references(() => formSubmission.id, { onDelete: 'restrict' }),
    fieldId: uuid('field_id')
      .notNull()
      .references(() => formField.id, { onDelete: 'restrict' }),
    value: jsonb('value').$type<unknown>(),
    updatedBy: uuid('updated_by')
      .notNull()
      .references(() => companyMember.id, { onDelete: 'restrict' }),
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
    answerId: uuid('answer_id')
      .notNull()
      .references(() => formAnswer.id, { onDelete: 'restrict' }),
    storageKey: text('storage_key').notNull(),
    originalName: text('original_name').notNull(),
    mimeType: text('mime_type').notNull(),
    sizeBytes: bigint('size_bytes', { mode: 'number' }).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    uploadedBy: uuid('uploaded_by')
      .notNull()
      .references(() => companyMember.id, { onDelete: 'restrict' }),
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
    submissionId: uuid('submission_id')
      .notNull()
      .references(() => formSubmission.id, { onDelete: 'restrict' }),
    reviewedBy: uuid('reviewed_by')
      .notNull()
      .references(() => companyMember.id, { onDelete: 'restrict' }),
    action: submissionReviewActionEnum('action').notNull(),
    note: text('note'),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [
    unique('submission_review_submission_id_unique').on(table.submissionId),
    index('submission_review_company_reviewer_created_idx').on(
      table.companyId,
      table.reviewedBy,
      table.createdAt,
    ),
  ],
);
