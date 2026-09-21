import type { RelationsHelper } from './types';

export const formRelations = (r: RelationsHelper) => ({
  organization: {
    formTemplates: r.many.formTemplate(),
  },
  organizationMember: {
    createdFormTemplates: r.many.formTemplate(),
    startedFormSubmissions: r.many.formSubmission({
      alias: 'startedFormSubmissions',
    }),
    submittedFormSubmissions: r.many.formSubmission({
      alias: 'submittedFormSubmissions',
    }),
    formAnswers: r.many.formAnswer(),
    formAttachments: r.many.formAnswerAttachment(),
    reviewEntries: r.many.formReviewEntry(),
  },
  role: {
    formAssignments: r.many.formAssignment(),
  },
  formTemplate: {
    organization: r.one.organization({
      from: r.formTemplate.organizationId,
      to: r.organization.id,
    }),
    creator: r.one.organizationMember({
      from: r.formTemplate.createdBy,
      to: r.organizationMember.id,
    }),
    versions: r.many.formVersion(),
    plans: r.many.formPlan(),
  },
  formVersion: {
    organization: r.one.organization({
      from: r.formVersion.organizationId,
      to: r.organization.id,
    }),
    template: r.one.formTemplate({
      from: r.formVersion.formTemplateId,
      to: r.formTemplate.id,
    }),
    creator: r.one.organizationMember({
      from: r.formVersion.createdBy,
      to: r.organizationMember.id,
    }),
    publisher: r.one.organizationMember({
      from: r.formVersion.publishedBy,
      to: r.organizationMember.id,
    }),
    sections: r.many.formSection(),
    fields: r.many.formField(),
    submissions: r.many.formSubmission(),
  },
  formSection: {
    organization: r.one.organization({
      from: r.formSection.organizationId,
      to: r.organization.id,
    }),
    version: r.one.formVersion({
      from: r.formSection.formVersionId,
      to: r.formVersion.id,
    }),
    fields: r.many.formField(),
  },
  formField: {
    organization: r.one.organization({
      from: r.formField.organizationId,
      to: r.organization.id,
    }),
    version: r.one.formVersion({
      from: r.formField.formVersionId,
      to: r.formVersion.id,
    }),
    section: r.one.formSection({
      from: r.formField.formSectionId,
      to: r.formSection.id,
    }),
    options: r.many.formFieldOption(),
    answers: r.many.formAnswer(),
  },
  formFieldOption: {
    organization: r.one.organization({
      from: r.formFieldOption.organizationId,
      to: r.organization.id,
    }),
    version: r.one.formVersion({
      from: r.formFieldOption.formVersionId,
      to: r.formVersion.id,
    }),
    field: r.one.formField({
      from: r.formFieldOption.fieldId,
      to: r.formField.id,
    }),
  },
  formPlan: {
    recurringSchedule: r.one.formPlanRecurringSchedule({
      from: r.formPlan.id,
      to: r.formPlanRecurringSchedule.planId,
    }),
    organization: r.one.organization({
      from: r.formPlan.organizationId,
      to: r.organization.id,
    }),
    template: r.one.formTemplate({
      from: r.formPlan.formTemplateId,
      to: r.formTemplate.id,
    }),
    targets: r.many.formPlanTarget(),
    periods: r.many.formPlanPeriod(),
    occurrences: r.many.formOccurrence(),
  },
  formPlanTarget: {
    organization: r.one.organization({
      from: r.formPlanTarget.organizationId,
      to: r.organization.id,
    }),
    plan: r.one.formPlan({ from: r.formPlanTarget.planId, to: r.formPlan.id }),
    role: r.one.role({ from: r.formPlanTarget.roleId, to: r.role.id }),
    member: r.one.organizationMember({
      from: r.formPlanTarget.organizationMemberId,
      to: r.organizationMember.id,
    }),
  },
  formPlanPeriod: {
    organization: r.one.organization({
      from: r.formPlanPeriod.organizationId,
      to: r.organization.id,
    }),
    plan: r.one.formPlan({ from: r.formPlanPeriod.planId, to: r.formPlan.id }),
    occurrences: r.many.formOccurrence(),
  },
  formOccurrence: {
    organization: r.one.organization({
      from: r.formOccurrence.organizationId,
      to: r.organization.id,
    }),
    plan: r.one.formPlan({ from: r.formOccurrence.planId, to: r.formPlan.id }),
    version: r.one.formVersion({
      from: r.formOccurrence.formVersionId,
      to: r.formVersion.id,
    }),
    period: r.one.formPlanPeriod({
      from: r.formOccurrence.periodId,
      to: r.formPlanPeriod.id,
    }),
    assignments: r.many.formAssignment(),
  },
  formAssignment: {
    organization: r.one.organization({
      from: r.formAssignment.organizationId,
      to: r.organization.id,
    }),
    occurrence: r.one.formOccurrence({
      from: r.formAssignment.occurrenceId,
      to: r.formOccurrence.id,
    }),
    role: r.one.role({ from: r.formAssignment.roleId, to: r.role.id }),
    member: r.one.organizationMember({
      from: r.formAssignment.organizationMemberId,
      to: r.organizationMember.id,
    }),
    submissions: r.many.formSubmission(),
  },
  formSubmission: {
    organization: r.one.organization({
      from: r.formSubmission.organizationId,
      to: r.organization.id,
    }),
    assignment: r.one.formAssignment({
      from: r.formSubmission.assignmentId,
      to: r.formAssignment.id,
    }),
    version: r.one.formVersion({
      from: r.formSubmission.formVersionId,
      to: r.formVersion.id,
    }),
    startedByMember: r.one.organizationMember({
      from: r.formSubmission.startedBy,
      to: r.organizationMember.id,
      alias: 'startedFormSubmissions',
    }),
    submittedByMember: r.one.organizationMember({
      from: r.formSubmission.submittedBy,
      to: r.organizationMember.id,
      alias: 'submittedFormSubmissions',
    }),
    contributors: r.many.formSubmissionContributor(),
    answers: r.many.formAnswer(),
    reviewEntries: r.many.formReviewEntry(),
  },
  formSubmissionContributor: {
    organization: r.one.organization({
      from: r.formSubmissionContributor.organizationId,
      to: r.organization.id,
    }),
    submission: r.one.formSubmission({
      from: r.formSubmissionContributor.submissionId,
      to: r.formSubmission.id,
    }),
    member: r.one.organizationMember({
      from: r.formSubmissionContributor.memberId,
      to: r.organizationMember.id,
    }),
  },
  formAnswer: {
    organization: r.one.organization({
      from: r.formAnswer.organizationId,
      to: r.organization.id,
    }),
    version: r.one.formVersion({
      from: r.formAnswer.formVersionId,
      to: r.formVersion.id,
    }),
    submission: r.one.formSubmission({
      from: r.formAnswer.submissionId,
      to: r.formSubmission.id,
    }),
    field: r.one.formField({ from: r.formAnswer.fieldId, to: r.formField.id }),
    updatedByMember: r.one.organizationMember({
      from: r.formAnswer.updatedBy,
      to: r.organizationMember.id,
    }),
    attachments: r.many.formAnswerAttachment(),
  },
  formAnswerAttachment: {
    organization: r.one.organization({
      from: r.formAnswerAttachment.organizationId,
      to: r.organization.id,
    }),
    answer: r.one.formAnswer({
      from: r.formAnswerAttachment.answerId,
      to: r.formAnswer.id,
    }),
    uploadedByMember: r.one.organizationMember({
      from: r.formAnswerAttachment.uploadedBy,
      to: r.organizationMember.id,
    }),
  },
  formReviewEntry: {
    organization: r.one.organization({
      from: r.formReviewEntry.organizationId,
      to: r.organization.id,
    }),
    submission: r.one.formSubmission({
      from: r.formReviewEntry.submissionId,
      to: r.formSubmission.id,
    }),
    answer: r.one.formAnswer({
      from: r.formReviewEntry.answerId,
      to: r.formAnswer.id,
    }),
    reviewedByMember: r.one.organizationMember({
      from: r.formReviewEntry.reviewedBy,
      to: r.organizationMember.id,
    }),
  },
});
