import { LocalFormAttachmentStorage } from '../../../storage/form-attachment.storage';
import { resolve } from 'node:path';
import { unitOfWork } from '../../unit-of-work';
import {
  FormAttachmentUseCase,
  CreateFormTemplateUseCase,
  UpdateFormTemplateUseCase,
  GetFormTemplateUseCase,
  ListFormTemplatesByCompanyUseCase,
  CreateFormSectionUseCase,
  CreateFormFieldUseCase,
  PublishFormVersionUseCase,
  ReorderFormSectionUseCase,
  ReorderFormFieldUseCase,
  EditFormFieldUseCase,
  DeleteFormFieldUseCase,
  CreateFormPlanUseCase,
  GetFormPlanUseCase,
  ListFormPlansUseCase,
  ActivateFormPlanUseCase,
  PauseFormPlanUseCase,
  PreviewScheduleUseCase,
  OpenDueOccurrencesUseCase,
  CancelOccurrenceUseCase,
  ListOccurrencesUseCase,
  ListMyAssignmentsUseCase,
  GetAssignmentUseCase,
  CancelAssignmentUseCase,
  ReplaceAssignmentUseCase,
  StartFormSubmissionUseCase,
  SaveFormSubmissionDraftUseCase,
  SubmitFormSubmissionUseCase,
  CreateCorrectionUseCase,
  GetFormSubmissionUseCase,
  ListFormSubmissionsUseCase,
  ListReviewQueueUseCase,
  GetReviewDetailUseCase,
  RecordAnswerReviewUseCase,
  RecordSectionReviewUseCase,
  FinalizeSubmissionReviewUseCase,
} from '@repo/applications';
import {
  companyMemberRepository,
  roleRepository,
  formTemplateRepository,
  formVersionRepository,
  formSectionRepository,
  formFieldRepository,
  formPlanRepository,
  formPlanTargetRepository,
  formPlanPeriodRepository,
  formOccurrenceRepository,
  formAssignmentRepository,
  formSubmissionRepository,
  formSubmissionContributorRepository,
  formAnswerRepository,
  formAnswerAttachmentRepository,
  formReviewEntryRepository,
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
  formSectionRepository,
  formFieldRepository,
);

export const listFormTemplatesByCompanyUseCase =
  new ListFormTemplatesByCompanyUseCase(formTemplateRepository);

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
  formSectionRepository,
  formFieldRepository,
);

export const reorderFormSectionUseCase = new ReorderFormSectionUseCase(
  unitOfWork,
  formVersionRepository,
  formSectionRepository,
);

export const reorderFormFieldUseCase = new ReorderFormFieldUseCase(
  unitOfWork,
  formVersionRepository,
  formFieldRepository,
);

export const editFormFieldUseCase = new EditFormFieldUseCase(
  unitOfWork,
  formVersionRepository,
  formFieldRepository,
  formSectionRepository,
);

export const deleteFormFieldUseCase = new DeleteFormFieldUseCase(
  unitOfWork,
  formVersionRepository,
  formFieldRepository,
);

// ==========================================
// Plan Use Cases
// ==========================================

export const createFormPlanUseCase = new CreateFormPlanUseCase(
  unitOfWork,
  formPlanRepository,
  formPlanTargetRepository,
  formPlanPeriodRepository,
  formTemplateRepository,
  formVersionRepository,
  companyMemberRepository,
);

export const getFormPlanUseCase = new GetFormPlanUseCase(formPlanRepository);

export const listFormPlansUseCase = new ListFormPlansUseCase(
  formPlanRepository,
);

export const activateFormPlanUseCase = new ActivateFormPlanUseCase(
  unitOfWork,
  formPlanRepository,
  formTemplateRepository,
  formVersionRepository,
  formPlanTargetRepository,
  formPlanPeriodRepository,
);

export const pauseFormPlanUseCase = new PauseFormPlanUseCase(
  unitOfWork,
  formPlanRepository,
);

export const previewScheduleUseCase = new PreviewScheduleUseCase(
  formPlanRepository,
  formPlanPeriodRepository,
);

// ==========================================
// Occurrence Use Cases
// ==========================================

export const openDueOccurrencesUseCase = new OpenDueOccurrencesUseCase(
  unitOfWork,
  formPlanRepository,
  formOccurrenceRepository,
  formAssignmentRepository,
  formPlanTargetRepository,
  formVersionRepository,
  formPlanPeriodRepository,
  companyMemberRepository,
);

export const cancelOccurrenceUseCase = new CancelOccurrenceUseCase(
  formOccurrenceRepository,
);

export const listOccurrencesUseCase = new ListOccurrencesUseCase(
  formOccurrenceRepository,
);

// ==========================================
// Assignment Use Cases
// ==========================================

export const listMyAssignmentsUseCase = new ListMyAssignmentsUseCase(
  formAssignmentRepository,
  companyMemberRepository,
  formOccurrenceRepository,
  formTemplateRepository,
  roleRepository,
);

export const getAssignmentUseCase = new GetAssignmentUseCase(
  formAssignmentRepository,
  companyMemberRepository,
);

export const cancelAssignmentUseCase = new CancelAssignmentUseCase(
  unitOfWork,
  formAssignmentRepository,
  formOccurrenceRepository,
);

export const replaceAssignmentUseCase = new ReplaceAssignmentUseCase(
  unitOfWork,
  formAssignmentRepository,
);

// ==========================================
// Submission Use Cases
// ==========================================

export const startFormSubmissionUseCase = new StartFormSubmissionUseCase(
  unitOfWork,
  formAssignmentRepository,
  formOccurrenceRepository,
  formSubmissionRepository,
  formSubmissionContributorRepository,
  companyMemberRepository,
);

export const saveFormSubmissionDraftUseCase =
  new SaveFormSubmissionDraftUseCase(
    unitOfWork,
    formSubmissionRepository,
    formAssignmentRepository,
    formAnswerRepository,
    formSubmissionContributorRepository,
    companyMemberRepository,
    formOccurrenceRepository,
    formFieldRepository,
  );

export const submitFormSubmissionUseCase = new SubmitFormSubmissionUseCase(
  unitOfWork,
  formSubmissionRepository,
  formAssignmentRepository,
  formOccurrenceRepository,
  formPlanRepository,
  formFieldRepository,
  formAnswerRepository,
  formAnswerAttachmentRepository,
  formSubmissionContributorRepository,
  companyMemberRepository,
);

export const createCorrectionUseCase = new CreateCorrectionUseCase(
  unitOfWork,
  formSubmissionRepository,
  formReviewEntryRepository,
  formAnswerRepository,
  formAnswerAttachmentRepository,
  formSubmissionContributorRepository,
  formAssignmentRepository,
  formOccurrenceRepository,
  companyMemberRepository,
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
  formAnswerAttachmentRepository,
  formAssignmentRepository,
  companyMemberRepository,
);

export const listFormSubmissionsUseCase = new ListFormSubmissionsUseCase(
  formSubmissionRepository,
  formAssignmentRepository,
  companyMemberRepository,
);

// ==========================================
// Review Use Cases
// ==========================================

export const listReviewQueueUseCase = new ListReviewQueueUseCase(
  formSubmissionRepository,
  formReviewEntryRepository,
  formAssignmentRepository,
  formOccurrenceRepository,
  formPlanRepository,
  formVersionRepository,
  formTemplateRepository,
  companyMemberRepository,
);

export const getReviewDetailUseCase = new GetReviewDetailUseCase(
  formReviewEntryRepository,
  formSubmissionRepository,
  formAssignmentRepository,
  companyMemberRepository,
);

export const recordAnswerReviewUseCase = new RecordAnswerReviewUseCase(
  unitOfWork,
  formSubmissionRepository,
  formAnswerRepository,
  formReviewEntryRepository,
  formSubmissionContributorRepository,
  companyMemberRepository,
);

export const recordSectionReviewUseCase = new RecordSectionReviewUseCase(
  unitOfWork,
  formSubmissionRepository,
  formSectionRepository,
  formReviewEntryRepository,
  formSubmissionContributorRepository,
  companyMemberRepository,
);

export const finalizeSubmissionReviewUseCase =
  new FinalizeSubmissionReviewUseCase(
    unitOfWork,
    formSubmissionRepository,
    formReviewEntryRepository,
    formSubmissionContributorRepository,
    companyMemberRepository,
    formAssignmentRepository,
    formOccurrenceRepository,
    formPlanRepository,
    formSectionRepository,
    formAnswerRepository,
    formFieldRepository,
  );

export const formAttachmentUseCase = new FormAttachmentUseCase(
  unitOfWork,
  formSubmissionRepository,
  formAssignmentRepository,
  formOccurrenceRepository,
  companyMemberRepository,
  formFieldRepository,
  formAnswerRepository,
  formAnswerAttachmentRepository,
  formSubmissionContributorRepository,
  new LocalFormAttachmentStorage(
    resolve(process.env.FORM_UPLOAD_DIR ?? '.data/form-attachments'),
  ),
);
