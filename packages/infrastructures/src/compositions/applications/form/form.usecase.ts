import { LocalFormAttachmentStorage } from '../../../storage/form-attachment.storage';
import { resolve } from 'node:path';
import { unitOfWork } from '../../unit-of-work';
import {
  FormAttachmentUseCase,
  CreateFormTemplateUseCase,
  UpdateFormTemplateUseCase,
  GetFormTemplateUseCase,
  ListFormTemplatesByOrganizationUseCase,
  CreateFormSectionUseCase,
  CreateFormFieldUseCase,
  PublishFormVersionUseCase,
  ReorderFormSectionUseCase,
  ReorderFormFieldUseCase,
  EditFormFieldUseCase,
  DeleteFormFieldUseCase,
  DeleteFormSectionUseCase,
  CreateFormPlanUseCase,
  UpdateFormPlanUseCase,
  GetFormPlanUseCase,
  ListFormPlansUseCase,
  ActivateFormPlanUseCase,
  PauseFormPlanUseCase,
  PreviewScheduleUseCase,
  OpenDueOccurrencesUseCase,
  CancelOccurrenceUseCase,
  ListOccurrencesUseCase,
  ListMyAssignmentsUseCase,
  ListOccurrenceAssignmentsUseCase,
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
  organizationMemberRepository,
  roleRepository,
  userRepository,
  formTemplateRepository,
  formVersionRepository,
  formSectionRepository,
  formFieldRepository,
  formFieldOptionRepository,
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

/**
 * Template & Builder Use Cases
 */

export const createFormTemplateUseCase = new CreateFormTemplateUseCase(
  unitOfWork,
  formTemplateRepository,
  formVersionRepository,
  organizationMemberRepository,
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

export const listFormTemplatesByOrganizationUseCase =
  new ListFormTemplatesByOrganizationUseCase(formTemplateRepository);

export const createFormSectionUseCase = new CreateFormSectionUseCase(
  unitOfWork,
  formVersionRepository,
  formSectionRepository,
);

export const createFormFieldUseCase = new CreateFormFieldUseCase(
  unitOfWork,
  formVersionRepository,
  formFieldRepository,
  formFieldOptionRepository,
);

export const publishFormVersionUseCase = new PublishFormVersionUseCase(
  unitOfWork,
  formVersionRepository,
  formSectionRepository,
  formFieldRepository,
  organizationMemberRepository,
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
  formFieldOptionRepository,
);

export const deleteFormFieldUseCase = new DeleteFormFieldUseCase(
  unitOfWork,
  formVersionRepository,
  formFieldRepository,
);

export const deleteFormSectionUseCase = new DeleteFormSectionUseCase(
  unitOfWork,
  formVersionRepository,
  formSectionRepository,
  formFieldRepository,
);

/**
 * Plan Use Cases
 */

export const createFormPlanUseCase = new CreateFormPlanUseCase(
  unitOfWork,
  formPlanRepository,
  formPlanTargetRepository,
  formPlanPeriodRepository,
  formTemplateRepository,
  formVersionRepository,
  organizationMemberRepository,
);

export const getFormPlanUseCase = new GetFormPlanUseCase(
  formPlanRepository,
  formPlanTargetRepository,
  formPlanPeriodRepository,
);

export const updateFormPlanUseCase = new UpdateFormPlanUseCase(
  unitOfWork,
  formPlanRepository,
  formPlanTargetRepository,
  formPlanPeriodRepository,
  formTemplateRepository,
  formVersionRepository,
  organizationMemberRepository,
);

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
  organizationMemberRepository,
);

export const pauseFormPlanUseCase = new PauseFormPlanUseCase(
  unitOfWork,
  formPlanRepository,
  organizationMemberRepository,
);

export const previewScheduleUseCase = new PreviewScheduleUseCase(
  formPlanRepository,
  formPlanPeriodRepository,
);

/**
 * Occurrence Use Cases
 */

export const openDueOccurrencesUseCase = new OpenDueOccurrencesUseCase(
  unitOfWork,
  formPlanRepository,
  formOccurrenceRepository,
  formAssignmentRepository,
  formPlanTargetRepository,
  formVersionRepository,
  formPlanPeriodRepository,
  organizationMemberRepository,
);

export const cancelOccurrenceUseCase = new CancelOccurrenceUseCase(
  formOccurrenceRepository,
);

export const listOccurrencesUseCase = new ListOccurrencesUseCase(
  formOccurrenceRepository,
);

/**
 * Assignment Use Cases
 */

export const listMyAssignmentsUseCase = new ListMyAssignmentsUseCase(
  formAssignmentRepository,
  organizationMemberRepository,
  formOccurrenceRepository,
  formTemplateRepository,
  roleRepository,
  formPlanRepository,
  formSubmissionRepository,
  formReviewEntryRepository,
);

export const listOccurrenceAssignmentsUseCase =
  new ListOccurrenceAssignmentsUseCase(
    formAssignmentRepository,
    formOccurrenceRepository,
    formPlanRepository,
    organizationMemberRepository,
    roleRepository,
    formSubmissionRepository,
    formReviewEntryRepository,
    userRepository,
  );

export const getAssignmentUseCase = new GetAssignmentUseCase(
  formAssignmentRepository,
  organizationMemberRepository,
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

/**
 * Submission Use Cases
 */

export const startFormSubmissionUseCase = new StartFormSubmissionUseCase(
  unitOfWork,
  formAssignmentRepository,
  formOccurrenceRepository,
  formSubmissionRepository,
  formSubmissionContributorRepository,
  organizationMemberRepository,
  formPlanRepository,
);

export const saveFormSubmissionDraftUseCase =
  new SaveFormSubmissionDraftUseCase(
    unitOfWork,
    formSubmissionRepository,
    formAssignmentRepository,
    formAnswerRepository,
    formSubmissionContributorRepository,
    organizationMemberRepository,
    formOccurrenceRepository,
    formFieldRepository,
    formPlanRepository,
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
  organizationMemberRepository,
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
  organizationMemberRepository,
  formPlanRepository,
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
  organizationMemberRepository,
);

export const listFormSubmissionsUseCase = new ListFormSubmissionsUseCase(
  formSubmissionRepository,
  formAssignmentRepository,
  organizationMemberRepository,
  formOccurrenceRepository,
  formPlanRepository,
  formTemplateRepository,
  formReviewEntryRepository,
  roleRepository,
  userRepository,
);

/**
 * Review Use Cases
 */

export const listReviewQueueUseCase = new ListReviewQueueUseCase(
  formSubmissionRepository,
  formReviewEntryRepository,
  formAssignmentRepository,
  formOccurrenceRepository,
  formPlanRepository,
  formVersionRepository,
  formTemplateRepository,
  organizationMemberRepository,
);

export const getReviewDetailUseCase = new GetReviewDetailUseCase(
  formReviewEntryRepository,
  formSubmissionRepository,
  formAssignmentRepository,
  organizationMemberRepository,
);

export const recordAnswerReviewUseCase = new RecordAnswerReviewUseCase(
  unitOfWork,
  formSubmissionRepository,
  formAnswerRepository,
  formReviewEntryRepository,
  formSubmissionContributorRepository,
  organizationMemberRepository,
);

export const recordSectionReviewUseCase = new RecordSectionReviewUseCase(
  unitOfWork,
  formSubmissionRepository,
  formSectionRepository,
  formReviewEntryRepository,
  formSubmissionContributorRepository,
  organizationMemberRepository,
  formAnswerRepository,
  formFieldRepository,
);

export const finalizeSubmissionReviewUseCase =
  new FinalizeSubmissionReviewUseCase(
    unitOfWork,
    formSubmissionRepository,
    formReviewEntryRepository,
    formSubmissionContributorRepository,
    organizationMemberRepository,
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
  organizationMemberRepository,
  formFieldRepository,
  formAnswerRepository,
  formAnswerAttachmentRepository,
  formSubmissionContributorRepository,
  new LocalFormAttachmentStorage(
    resolve(process.env.FORM_UPLOAD_DIR ?? '.data/form-attachments'),
  ),
);
