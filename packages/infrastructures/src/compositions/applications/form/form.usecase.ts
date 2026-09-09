import {
  AssignFormRolesUseCase,
  CloneFormSubmissionUseCase,
  CreateFormFieldUseCase,
  CreateFormSectionUseCase,
  CreateFormTemplateUseCase,
  GetFormSubmissionUseCase,
  GetFormTemplateUseCase,
  ListFormSubmissionsUseCase,
  ListFormTemplatesByCompanyUseCase,
  PublishFormVersionUseCase,
  ReviewFormSubmissionUseCase,
  SaveFormSubmissionDraftUseCase,
  StartFormSubmissionUseCase,
  SubmitFormSubmissionUseCase,
  UpdateFormTemplateUseCase,
} from '@repo/applications';
import {
  companyMemberRepository,
  formAnswerAttachmentRepository,
  formAnswerRepository,
  formFieldRepository,
  formSectionRepository,
  formSubmissionContributorRepository,
  formSubmissionRepository,
  formTemplateRepository,
  formTemplateRoleRepository,
  formVersionRepository,
  roleRepository,
  submissionReviewRepository,
} from '../../repositories';

// ==========================================
// Template & Builder Use Cases
// ==========================================

export const createFormTemplateUseCase = new CreateFormTemplateUseCase(
  formTemplateRepository,
  formVersionRepository,
);

export const updateFormTemplateUseCase = new UpdateFormTemplateUseCase(
  formTemplateRepository,
);

export const getFormTemplateUseCase = new GetFormTemplateUseCase(
  formTemplateRepository,
  formVersionRepository,
  formTemplateRoleRepository,
  formSectionRepository,
  formFieldRepository,
);

export const listFormTemplatesByCompanyUseCase =
  new ListFormTemplatesByCompanyUseCase(formTemplateRepository);

export const assignFormRolesUseCase = new AssignFormRolesUseCase(
  formTemplateRepository,
  formTemplateRoleRepository,
);

export const createFormSectionUseCase = new CreateFormSectionUseCase(
  formVersionRepository,
  formSectionRepository,
);

export const createFormFieldUseCase = new CreateFormFieldUseCase(
  formVersionRepository,
  formFieldRepository,
);

export const publishFormVersionUseCase = new PublishFormVersionUseCase(
  formVersionRepository,
  formTemplateRoleRepository,
  formSectionRepository,
  formFieldRepository,
);

// ==========================================
// Submission Use Cases
// ==========================================

export const startFormSubmissionUseCase = new StartFormSubmissionUseCase(
  formSubmissionRepository,
  formTemplateRepository,
  formTemplateRoleRepository,
  formVersionRepository,
  formSubmissionContributorRepository,
);

export const saveFormSubmissionDraftUseCase =
  new SaveFormSubmissionDraftUseCase(
    formSubmissionRepository,
    formAnswerRepository,
    formSubmissionContributorRepository,
  );

export const submitFormSubmissionUseCase = new SubmitFormSubmissionUseCase(
  formSubmissionRepository,
  formFieldRepository,
  formAnswerRepository,
  formAnswerAttachmentRepository,
  formSubmissionContributorRepository,
);

export const cloneFormSubmissionUseCase = new CloneFormSubmissionUseCase(
  formSubmissionRepository,
  formAnswerRepository,
  formAnswerAttachmentRepository,
  formSubmissionContributorRepository,
);

export const getFormSubmissionUseCase = new GetFormSubmissionUseCase(
  formSubmissionRepository,
  formTemplateRepository,
  formVersionRepository,
  formSectionRepository,
  formFieldRepository,
  formAnswerRepository,
  formSubmissionContributorRepository,
  submissionReviewRepository,
);

export const listFormSubmissionsUseCase = new ListFormSubmissionsUseCase(
  formSubmissionRepository,
);

// ==========================================
// Review Use Case
// ==========================================

export const reviewFormSubmissionUseCase = new ReviewFormSubmissionUseCase(
  formSubmissionRepository,
  submissionReviewRepository,
  formSubmissionContributorRepository,
  companyMemberRepository,
  roleRepository,
);
