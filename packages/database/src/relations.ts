import { defineRelationsPart } from 'drizzle-orm';
import * as schema from './schema';

export const relations = defineRelationsPart(schema, (r) => ({
  user: {
    sessions: r.many.session(),
    accounts: r.many.account(),
    memberships: r.many.companyMember(),
    recordedAttendanceLogs: r.many.attendanceLogs(),
    reviewedLeaveRequests: r.many.leaveRequests(),
  },
  session: {
    user: r.one.user({
      from: r.session.userId,
      to: r.user.id,
    }),
  },
  account: {
    user: r.one.user({
      from: r.account.userId,
      to: r.user.id,
    }),
  },
  company: {
    members: r.many.companyMember(),
    roles: r.many.role(),
    companyFeatures: r.many.companyFeature(),
    roleFeatures: r.many.roleFeature(),
    checkInSchedules: r.many.checkInSchedules(),
    leaveTypes: r.many.leaveTypes(),
    formTemplates: r.many.formTemplate(),
  },
  companyBranch: {
    company: r.one.company({
      from: r.companyBranch.companyId,
      to: r.company.id,
    }),
    members: r.many.companyMember(),
  },
  companyMember: {
    company: r.one.company({
      from: r.companyMember.companyId,
      to: r.company.id,
    }),
    user: r.one.user({
      from: r.companyMember.userId,
      to: r.user.id,
    }),
    role: r.one.role({
      from: r.companyMember.roleId,
      to: r.role.id,
    }),
    branch: r.one.companyBranch({
      from: r.companyMember.companyBranchId,
      to: r.companyBranch.id,
    }),
    attendanceLogs: r.many.attendanceLogs(),
    leaveQuotas: r.many.leaveQuotas(),
    leaveRequests: r.many.leaveRequests(),
    createdFormTemplates: r.many.formTemplate(),
    startedFormSubmissions: r.many.formSubmission(),
    submittedFormSubmissions: r.many.formSubmission(),
    formAnswers: r.many.formAnswer(),
    formAttachments: r.many.formAnswerAttachment(),
    submissionReviews: r.many.submissionReview(),
  },
  role: {
    company: r.one.company({
      from: r.role.companyId,
      to: r.company.id,
    }),
    rolePermissions: r.many.rolePermission(),
    roleFeatures: r.many.roleFeature(),
    members: r.many.companyMember(),
    checkInSchedule: r.one.checkInSchedules({
      from: r.role.id,
      to: r.checkInSchedules.roleId,
    }),
    formTemplateRoles: r.many.formTemplateRole(),
    formSubmissions: r.many.formSubmission(),
  },
  permission: {
    rolePermissions: r.many.rolePermission(),
    feature: r.one.feature({
      from: r.permission.featureId,
      to: r.feature.id,
    }),
  },
  rolePermission: {
    role: r.one.role({
      from: r.rolePermission.roleId,
      to: r.role.id,
    }),
    permission: r.one.permission({
      from: r.rolePermission.permissionId,
      to: r.permission.id,
    }),
  },
  feature: {
    companyFeatures: r.many.companyFeature(),
    roleFeatures: r.many.roleFeature(),
    permissions: r.many.permission(),
  },
  companyFeature: {
    company: r.one.company({
      from: r.companyFeature.companyId,
      to: r.company.id,
    }),
    feature: r.one.feature({
      from: r.companyFeature.featureId,
      to: r.feature.id,
    }),
    assignedByUser: r.one.user({
      from: r.companyFeature.assignedBy,
      to: r.user.id,
    }),
  },
  roleFeature: {
    company: r.one.company({
      from: r.roleFeature.companyId,
      to: r.company.id,
    }),
    role: r.one.role({
      from: r.roleFeature.roleId,
      to: r.role.id,
    }),
    feature: r.one.feature({
      from: r.roleFeature.featureId,
      to: r.feature.id,
    }),
  },
  checkInSchedules: {
    role: r.one.role({
      from: r.checkInSchedules.roleId,
      to: r.role.id,
    }),
    company: r.one.company({
      from: r.checkInSchedules.companyId,
      to: r.company.id,
    }),
    slots: r.many.scheduleSlots(),
  },
  scheduleSlots: {
    schedule: r.one.checkInSchedules({
      from: r.scheduleSlots.checkInScheduleId,
      to: r.checkInSchedules.id,
    }),
    attendanceLogs: r.many.attendanceLogs(),
  },
  attendanceLogs: {
    member: r.one.companyMember({
      from: r.attendanceLogs.companyMemberId,
      to: r.companyMember.id,
    }),
    slot: r.one.scheduleSlots({
      from: r.attendanceLogs.scheduleSlotId,
      to: r.scheduleSlots.id,
    }),
    recordedByUser: r.one.user({
      from: r.attendanceLogs.recordedBy,
      to: r.user.id,
    }),
  },
  leaveTypes: {
    company: r.one.company({
      from: r.leaveTypes.companyId,
      to: r.company.id,
    }),
    quotas: r.many.leaveQuotas(),
    requests: r.many.leaveRequests(),
  },
  leaveQuotas: {
    member: r.one.companyMember({
      from: r.leaveQuotas.companyMemberId,
      to: r.companyMember.id,
    }),
    leaveType: r.one.leaveTypes({
      from: r.leaveQuotas.leaveTypeId,
      to: r.leaveTypes.id,
    }),
  },
  leaveRequests: {
    member: r.one.companyMember({
      from: r.leaveRequests.companyMemberId,
      to: r.companyMember.id,
    }),
    leaveType: r.one.leaveTypes({
      from: r.leaveRequests.leaveTypeId,
      to: r.leaveTypes.id,
    }),
    reviewedByUser: r.one.user({
      from: r.leaveRequests.reviewedBy,
      to: r.user.id,
    }),
  },
  formTemplate: {
    company: r.one.company({
      from: r.formTemplate.companyId,
      to: r.company.id,
    }),
    creator: r.one.companyMember({
      from: r.formTemplate.createdBy,
      to: r.companyMember.id,
    }),
    versions: r.many.formVersion(),
    roles: r.many.formTemplateRole(),
    submissions: r.many.formSubmission(),
  },
  formTemplateRole: {
    company: r.one.company({
      from: r.formTemplateRole.companyId,
      to: r.company.id,
    }),
    template: r.one.formTemplate({
      from: r.formTemplateRole.formTemplateId,
      to: r.formTemplate.id,
    }),
    role: r.one.role({
      from: r.formTemplateRole.roleId,
      to: r.role.id,
    }),
  },
  formVersion: {
    company: r.one.company({
      from: r.formVersion.companyId,
      to: r.company.id,
    }),
    template: r.one.formTemplate({
      from: r.formVersion.formTemplateId,
      to: r.formTemplate.id,
    }),
    creator: r.one.companyMember({
      from: r.formVersion.createdBy,
      to: r.companyMember.id,
    }),
    publisher: r.one.companyMember({
      from: r.formVersion.publishedBy,
      to: r.companyMember.id,
    }),
    sections: r.many.formSection(),
    fields: r.many.formField(),
    submissions: r.many.formSubmission(),
  },
  formSection: {
    company: r.one.company({
      from: r.formSection.companyId,
      to: r.company.id,
    }),
    version: r.one.formVersion({
      from: r.formSection.formVersionId,
      to: r.formVersion.id,
    }),
    fields: r.many.formField(),
  },
  formField: {
    company: r.one.company({
      from: r.formField.companyId,
      to: r.company.id,
    }),
    version: r.one.formVersion({
      from: r.formField.formVersionId,
      to: r.formVersion.id,
    }),
    section: r.one.formSection({
      from: r.formField.formSectionId,
      to: r.formSection.id,
    }),
    answers: r.many.formAnswer(),
  },
  formSubmission: {
    company: r.one.company({
      from: r.formSubmission.companyId,
      to: r.company.id,
    }),
    template: r.one.formTemplate({
      from: r.formSubmission.formTemplateId,
      to: r.formTemplate.id,
    }),
    version: r.one.formVersion({
      from: r.formSubmission.formVersionId,
      to: r.formVersion.id,
    }),
    role: r.one.role({
      from: r.formSubmission.roleId,
      to: r.role.id,
    }),
    startedByMember: r.one.companyMember({
      from: r.formSubmission.startedBy,
      to: r.companyMember.id,
    }),
    submittedByMember: r.one.companyMember({
      from: r.formSubmission.submittedBy,
      to: r.companyMember.id,
    }),
    contributors: r.many.formSubmissionContributor(),
    answers: r.many.formAnswer(),
    review: r.one.submissionReview({
      from: r.formSubmission.id,
      to: r.submissionReview.submissionId,
    }),
  },
  formSubmissionContributor: {
    company: r.one.company({
      from: r.formSubmissionContributor.companyId,
      to: r.company.id,
    }),
    submission: r.one.formSubmission({
      from: r.formSubmissionContributor.submissionId,
      to: r.formSubmission.id,
    }),
    member: r.one.companyMember({
      from: r.formSubmissionContributor.memberId,
      to: r.companyMember.id,
    }),
  },
  formAnswer: {
    company: r.one.company({
      from: r.formAnswer.companyId,
      to: r.company.id,
    }),
    version: r.one.formVersion({
      from: r.formAnswer.formVersionId,
      to: r.formVersion.id,
    }),
    submission: r.one.formSubmission({
      from: r.formAnswer.submissionId,
      to: r.formSubmission.id,
    }),
    field: r.one.formField({
      from: r.formAnswer.fieldId,
      to: r.formField.id,
    }),
    updatedByMember: r.one.companyMember({
      from: r.formAnswer.updatedBy,
      to: r.companyMember.id,
    }),
    attachments: r.many.formAnswerAttachment(),
  },
  formAnswerAttachment: {
    company: r.one.company({
      from: r.formAnswerAttachment.companyId,
      to: r.company.id,
    }),
    answer: r.one.formAnswer({
      from: r.formAnswerAttachment.answerId,
      to: r.formAnswer.id,
    }),
    uploadedByMember: r.one.companyMember({
      from: r.formAnswerAttachment.uploadedBy,
      to: r.companyMember.id,
    }),
  },
  submissionReview: {
    company: r.one.company({
      from: r.submissionReview.companyId,
      to: r.company.id,
    }),
    submission: r.one.formSubmission({
      from: r.submissionReview.submissionId,
      to: r.formSubmission.id,
    }),
    reviewedByMember: r.one.companyMember({
      from: r.submissionReview.reviewedBy,
      to: r.companyMember.id,
    }),
  },
}));
