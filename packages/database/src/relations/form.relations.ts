import type { RelationsHelper } from './types';

export const formRelations = (r: RelationsHelper) => ({
  company: {
    formTemplates: r.many.formTemplate(),
  },
  companyMember: {
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
    company: r.one.company({
      from: r.formTemplate.companyId,
      to: r.company.id,
    }),
    creator: r.one.companyMember({
      from: r.formTemplate.createdBy,
      to: r.companyMember.id,
    }),
    versions: r.many.formVersion(),
    plans: r.many.formPlan(),
  },
  formVersion: {
    company: r.one.company({ from: r.formVersion.companyId, to: r.company.id }),
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
    company: r.one.company({ from: r.formSection.companyId, to: r.company.id }),
    version: r.one.formVersion({
      from: r.formSection.formVersionId,
      to: r.formVersion.id,
    }),
    fields: r.many.formField(),
  },
  formField: {
    company: r.one.company({ from: r.formField.companyId, to: r.company.id }),
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
    company: r.one.company({
      from: r.formFieldOption.companyId,
      to: r.company.id,
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
    company: r.one.company({ from: r.formPlan.companyId, to: r.company.id }),
    template: r.one.formTemplate({
      from: r.formPlan.formTemplateId,
      to: r.formTemplate.id,
    }),
    targets: r.many.formPlanTarget(),
    periods: r.many.formPlanPeriod(),
    occurrences: r.many.formOccurrence(),
  },
  formPlanTarget: {
    company: r.one.company({
      from: r.formPlanTarget.companyId,
      to: r.company.id,
    }),
    plan: r.one.formPlan({ from: r.formPlanTarget.planId, to: r.formPlan.id }),
    role: r.one.role({ from: r.formPlanTarget.roleId, to: r.role.id }),
    member: r.one.companyMember({
      from: r.formPlanTarget.companyMemberId,
      to: r.companyMember.id,
    }),
  },
  formPlanPeriod: {
    company: r.one.company({
      from: r.formPlanPeriod.companyId,
      to: r.company.id,
    }),
    plan: r.one.formPlan({ from: r.formPlanPeriod.planId, to: r.formPlan.id }),
    occurrences: r.many.formOccurrence(),
  },
  formOccurrence: {
    company: r.one.company({
      from: r.formOccurrence.companyId,
      to: r.company.id,
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
    company: r.one.company({
      from: r.formAssignment.companyId,
      to: r.company.id,
    }),
    occurrence: r.one.formOccurrence({
      from: r.formAssignment.occurrenceId,
      to: r.formOccurrence.id,
    }),
    role: r.one.role({ from: r.formAssignment.roleId, to: r.role.id }),
    member: r.one.companyMember({
      from: r.formAssignment.companyMemberId,
      to: r.companyMember.id,
    }),
    submissions: r.many.formSubmission(),
  },
  formSubmission: {
    company: r.one.company({
      from: r.formSubmission.companyId,
      to: r.company.id,
    }),
    assignment: r.one.formAssignment({
      from: r.formSubmission.assignmentId,
      to: r.formAssignment.id,
    }),
    version: r.one.formVersion({
      from: r.formSubmission.formVersionId,
      to: r.formVersion.id,
    }),
    startedByMember: r.one.companyMember({
      from: r.formSubmission.startedBy,
      to: r.companyMember.id,
      alias: 'startedFormSubmissions',
    }),
    submittedByMember: r.one.companyMember({
      from: r.formSubmission.submittedBy,
      to: r.companyMember.id,
      alias: 'submittedFormSubmissions',
    }),
    contributors: r.many.formSubmissionContributor(),
    answers: r.many.formAnswer(),
    reviewEntries: r.many.formReviewEntry(),
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
    company: r.one.company({ from: r.formAnswer.companyId, to: r.company.id }),
    version: r.one.formVersion({
      from: r.formAnswer.formVersionId,
      to: r.formVersion.id,
    }),
    submission: r.one.formSubmission({
      from: r.formAnswer.submissionId,
      to: r.formSubmission.id,
    }),
    field: r.one.formField({ from: r.formAnswer.fieldId, to: r.formField.id }),
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
  formReviewEntry: {
    company: r.one.company({
      from: r.formReviewEntry.companyId,
      to: r.company.id,
    }),
    submission: r.one.formSubmission({
      from: r.formReviewEntry.submissionId,
      to: r.formSubmission.id,
    }),
    answer: r.one.formAnswer({
      from: r.formReviewEntry.answerId,
      to: r.formAnswer.id,
    }),
    reviewedByMember: r.one.companyMember({
      from: r.formReviewEntry.reviewedBy,
      to: r.companyMember.id,
    }),
  },
});
