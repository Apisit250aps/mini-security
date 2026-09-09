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
    submissionReviews: r.many.submissionReview(),
  },
  role: {
    formTemplateRoles: r.many.formTemplateRole(),
    formSubmissions: r.many.formSubmission(),
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
      alias: 'startedFormSubmissions',
    }),
    submittedByMember: r.one.companyMember({
      from: r.formSubmission.submittedBy,
      to: r.companyMember.id,
      alias: 'submittedFormSubmissions',
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
});
