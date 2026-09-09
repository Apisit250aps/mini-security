import { Hono } from 'hono';
import {
  assignFormRolesUseCase,
  cloneFormSubmissionUseCase,
  createFormFieldUseCase,
  createFormSectionUseCase,
  createFormTemplateUseCase,
  getFormSubmissionUseCase,
  getFormTemplateUseCase,
  listFormSubmissionsUseCase,
  listFormTemplatesByCompanyUseCase,
  publishFormVersionUseCase,
  reviewFormSubmissionUseCase,
  saveFormSubmissionDraftUseCase,
  startFormSubmissionUseCase,
  submitFormSubmissionUseCase,
  updateFormTemplateUseCase,
} from '@repo/infrastructures/compositions';
import { FormController } from '../controllers/form.controller';
import { authMiddleware } from '../middleware';

const formController = new FormController(
  createFormTemplateUseCase,
  updateFormTemplateUseCase,
  getFormTemplateUseCase,
  listFormTemplatesByCompanyUseCase,
  assignFormRolesUseCase,
  createFormSectionUseCase,
  createFormFieldUseCase,
  publishFormVersionUseCase,
  startFormSubmissionUseCase,
  saveFormSubmissionDraftUseCase,
  submitFormSubmissionUseCase,
  cloneFormSubmissionUseCase,
  getFormSubmissionUseCase,
  listFormSubmissionsUseCase,
  reviewFormSubmissionUseCase,
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
formRoutes.post('/templates/:id/roles', formController.assignRoles);
formRoutes.post('/templates/:id/sections', formController.createSection);
formRoutes.post('/templates/:id/fields', formController.createField);
formRoutes.post('/templates/:id/publish', formController.publishVersion);

// --- Form Submissions ---
formRoutes.post('/submissions', formController.startSubmission);
formRoutes.put('/submissions/:id/draft', formController.saveDraft);
formRoutes.post('/submissions/:id/submit', formController.submit);
formRoutes.post('/submissions/:id/clone', formController.clone);
formRoutes.get('/submissions/:id', formController.getSubmission);
formRoutes.get('/submissions', formController.listSubmissions);

// --- Submission Review ---
formRoutes.post('/submissions/:id/review', formController.review);

export default formRoutes;
