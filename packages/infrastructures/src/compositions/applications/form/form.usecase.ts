import { unitOfWork } from '../../unit-of-work';
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
  unitOfWork,
  formTemplateRepository,
  formVersionRepository,
);

export const updateFormTemplateUseCase = new UpdateFormTemplateUseCase(
  formTemplateRepository,
);

export const getFormTemplateUseCase = new GetFormTemplateUseCase(
  unitOfWork,
  formTemplateRepository,
  formVersionRepository,
  formTemplateRoleRepository,
  formSectionRepository,
  formFieldRepository,
);

export const listFormTemplatesByCompanyUseCase =
  new ListFormTemplatesByCompanyUseCase(formTemplateRepository);

export const assignFormRolesUseCase = new AssignFormRolesUseCase(
  unitOfWork,
  formTemplateRepository,
  formTemplateRoleRepository,
);

export const createFormSectionUseCase = new CreateFormSectionUseCase(
  unitOfWork,
  formVersionRepository,
  formSectionRepository,
);

export const createFormFieldUseCase = new CreateFormFieldUseCase(
  unitOfWork,
  formVersionRepository,
  formFieldRepository,
);

export const publishFormVersionUseCase = new PublishFormVersionUseCase(
  unitOfWork,
  formVersionRepository,
  formTemplateRoleRepository,
  formSectionRepository,
  formFieldRepository,
);

// ==========================================
// Submission Use Cases
// ==========================================

export const startFormSubmissionUseCase = new StartFormSubmissionUseCase(
  unitOfWork,
  formSubmissionRepository,
  formTemplateRepository,
  formTemplateRoleRepository,
  formVersionRepository,
  formSubmissionContributorRepository,
);

export const saveFormSubmissionDraftUseCase =
  new SaveFormSubmissionDraftUseCase(
    unitOfWork,
    formSubmissionRepository,
    formAnswerRepository,
    formSubmissionContributorRepository,
  );

export const submitFormSubmissionUseCase = new SubmitFormSubmissionUseCase(
  unitOfWork,
  formSubmissionRepository,
  formFieldRepository,
  formAnswerRepository,
  formAnswerAttachmentRepository,
  formSubmissionContributorRepository,
);

export const cloneFormSubmissionUseCase = new CloneFormSubmissionUseCase(
  unitOfWork,
  formSubmissionRepository,
  formAnswerRepository,
  formAnswerAttachmentRepository,
  formSubmissionContributorRepository,
);

export const getFormSubmissionUseCase = new GetFormSubmissionUseCase(
  unitOfWork,
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
  unitOfWork,
  formSubmissionRepository,
  submissionReviewRepository,
  formSubmissionContributorRepository,
  companyMemberRepository,
  roleRepository,
);
