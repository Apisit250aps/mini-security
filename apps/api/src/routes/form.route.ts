import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import {
  formAttachmentUseCase,
  createFormTemplateUseCase,
  updateFormTemplateUseCase,
  getFormTemplateUseCase,
  listFormTemplatesByCompanyUseCase,
  createFormSectionUseCase,
  createFormFieldUseCase,
  editFormFieldUseCase,
  deleteFormFieldUseCase,
  deleteFormSectionUseCase,
  publishFormVersionUseCase,
  reorderFormSectionUseCase,
  reorderFormFieldUseCase,
  createFormPlanUseCase,
  updateFormPlanUseCase,
  getFormPlanUseCase,
  listFormPlansUseCase,
  activateFormPlanUseCase,
  pauseFormPlanUseCase,
  previewScheduleUseCase,
  openDueOccurrencesUseCase,
  cancelOccurrenceUseCase,
  listOccurrencesUseCase,
  listMyAssignmentsUseCase,
  listOccurrenceAssignmentsUseCase,
  getAssignmentUseCase,
  cancelAssignmentUseCase,
  replaceAssignmentUseCase,
  startFormSubmissionUseCase,
  saveFormSubmissionDraftUseCase,
  submitFormSubmissionUseCase,
  createCorrectionUseCase,
  getFormSubmissionUseCase,
  listFormSubmissionsUseCase,
  listReviewQueueUseCase,
  getReviewDetailUseCase,
  recordAnswerReviewUseCase,
  recordSectionReviewUseCase,
  finalizeSubmissionReviewUseCase,
} from '@repo/infrastructures/compositions';
import { FormController } from '../controllers/form.controller';
import { authMiddleware } from '../middleware';

const formController = new FormController(
  formAttachmentUseCase,
  createFormTemplateUseCase,
  updateFormTemplateUseCase,
  getFormTemplateUseCase,
  listFormTemplatesByCompanyUseCase,
  createFormSectionUseCase,
  createFormFieldUseCase,
  editFormFieldUseCase,
  deleteFormFieldUseCase,
  deleteFormSectionUseCase,
  publishFormVersionUseCase,
  reorderFormSectionUseCase,
  reorderFormFieldUseCase,
  createFormPlanUseCase,
  updateFormPlanUseCase,
  getFormPlanUseCase,
  listFormPlansUseCase,
  activateFormPlanUseCase,
  pauseFormPlanUseCase,
  previewScheduleUseCase,
  openDueOccurrencesUseCase,
  cancelOccurrenceUseCase,
  listOccurrencesUseCase,
  listMyAssignmentsUseCase,
  listOccurrenceAssignmentsUseCase,
  getAssignmentUseCase,
  cancelAssignmentUseCase,
  replaceAssignmentUseCase,
  startFormSubmissionUseCase,
  saveFormSubmissionDraftUseCase,
  submitFormSubmissionUseCase,
  createCorrectionUseCase,
  getFormSubmissionUseCase,
  listFormSubmissionsUseCase,
  listReviewQueueUseCase,
  getReviewDetailUseCase,
  recordAnswerReviewUseCase,
  recordSectionReviewUseCase,
  finalizeSubmissionReviewUseCase,
);

const formRoutes = new Hono();

formRoutes.use('*', authMiddleware);

// --- Form Templates & Builder ---
formRoutes.post('/templates', formController.createTemplate);
formRoutes.put('/templates/:id', formController.updateTemplate);
formRoutes.get('/templates/:id', formController.getTemplate);
formRoutes.get(
  '/companies/:companyId/templates',
  formController.listTemplatesByCompany,
);
formRoutes.post('/templates/:id/sections', formController.createSection);
formRoutes.delete(
  '/templates/:id/sections/:sectionId',
  formController.deleteSection,
);
formRoutes.post('/templates/:id/fields', formController.createField);
formRoutes.put('/templates/:id/fields/:fieldId', formController.editField);
formRoutes.delete('/templates/:id/fields/:fieldId', formController.deleteField);
formRoutes.post('/templates/:id/publish', formController.publishVersion);
formRoutes.patch(
  '/templates/:id/sections/reorder',
  formController.reorderSections,
);
formRoutes.patch('/templates/:id/fields/reorder', formController.reorderFields);

// --- Plans ---
formRoutes.post('/plans', formController.createPlan);
formRoutes.get('/plans', formController.listPlans);
formRoutes.get('/plans/:id', formController.getPlan);
formRoutes.put('/plans/:id', formController.updatePlan);
formRoutes.patch('/plans/:id', formController.updatePlan);
formRoutes.post('/plans/:id/activate', formController.activatePlan);
formRoutes.post('/plans/:id/pause', formController.pausePlan);
formRoutes.get('/plans/:id/schedule-preview', formController.previewSchedule);

// --- Occurrences ---
formRoutes.get('/occurrences', formController.listOccurrences);
formRoutes.get(
  '/occurrences/:id/assignments',
  formController.listOccurrenceAssignments,
);
formRoutes.post('/occurrences/open', formController.openOccurrences);
formRoutes.post('/occurrences/:id/cancel', formController.cancelOccurrence);

// --- Assignments ---
formRoutes.get('/assignments', formController.listMyAssignments);
formRoutes.get('/assignments/:id', formController.getAssignment);
formRoutes.post('/assignments/:id/cancel', formController.cancelAssignment);
formRoutes.post('/assignments/:id/replace', formController.replaceAssignment);

formRoutes.post(
  '/submissions/:id/fields/:fieldId/attachments',
  bodyLimit({ maxSize: 11 * 1024 * 1024 }),
  formController.uploadAttachment,
);
formRoutes.get('/attachments/:attachmentId', formController.downloadAttachment);
formRoutes.delete(
  '/attachments/:attachmentId',
  formController.deleteAttachment,
);

// --- Submissions ---
formRoutes.post('/submissions', formController.startSubmission);
formRoutes.put('/submissions/:id/draft', formController.saveDraft);
formRoutes.post('/submissions/:id/submit', formController.submit);
formRoutes.post('/submissions/:id/correction', formController.createCorrection);
formRoutes.get('/submissions/:id', formController.getSubmission);
formRoutes.get('/submissions', formController.listSubmissions);

// --- Reviews ---
formRoutes.get('/reviews', formController.listReviewQueue);
formRoutes.get(
  '/submissions/:id/review-entries',
  formController.getReviewDetail,
);
formRoutes.post(
  '/submissions/:id/answers/:answerId/review',
  formController.recordAnswerReview,
);
formRoutes.post(
  '/submissions/:id/sections/:sectionId/review',
  formController.recordSectionReview,
);
formRoutes.post(
  '/submissions/:id/finalize-review',
  formController.finalizeReview,
);

export default formRoutes;
