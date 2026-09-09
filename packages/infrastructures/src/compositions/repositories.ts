import db from '@repo/database/db';
import {
  AccountRepository,
  AttendanceLogRepository,
  CheckInScheduleRepository,
  CompanyBranchRepository,
  CompanyFeatureRepository,
  CompanyMemberRepository,
  CompanyRepository,
  FeatureRepository,
  FormAnswerAttachmentRepository,
  FormAnswerRepository,
  FormFieldRepository,
  FormSectionRepository,
  FormSubmissionContributorRepository,
  FormSubmissionRepository,
  FormTemplateRepository,
  FormTemplateRoleRepository,
  FormVersionRepository,
  LeaveQuotaRepository,
  LeaveRequestRepository,
  LeaveTypeRepository,
  PermissionRepository,
  RoleFeatureRepository,
  RolePermissionRepository,
  RoleRepository,
  ScheduleSlotRepository,
  SessionRepository,
  SubmissionReviewRepository,
  UserRepository,
} from '#repositories';

export const userRepository = new UserRepository(db);

export const companyRepository = new CompanyRepository(db);
export const companyBranchRepository = new CompanyBranchRepository(db);
export const companyMemberRepository = new CompanyMemberRepository(db);

export const featureRepository = new FeatureRepository(db);
export const companyFeatureRepository = new CompanyFeatureRepository(db);
export const roleFeatureRepository = new RoleFeatureRepository(db);

export const roleRepository = new RoleRepository(db);
export const permissionRepository = new PermissionRepository(db);
export const rolePermissionRepository = new RolePermissionRepository(db);

export const sessionRepository = new SessionRepository(db);
export const accountRepository = new AccountRepository(db);

export const checkInScheduleRepository = new CheckInScheduleRepository(db);
export const scheduleSlotRepository = new ScheduleSlotRepository(db);
export const attendanceLogRepository = new AttendanceLogRepository(db);

export const leaveTypeRepository = new LeaveTypeRepository(db);
export const leaveQuotaRepository = new LeaveQuotaRepository(db);
export const leaveRequestRepository = new LeaveRequestRepository(db);

export const formTemplateRepository = new FormTemplateRepository(db);
export const formTemplateRoleRepository = new FormTemplateRoleRepository(db);
export const formVersionRepository = new FormVersionRepository(db);
export const formSectionRepository = new FormSectionRepository(db);
export const formFieldRepository = new FormFieldRepository(db);
export const formSubmissionRepository = new FormSubmissionRepository(db);
export const formSubmissionContributorRepository =
  new FormSubmissionContributorRepository(db);
export const formAnswerRepository = new FormAnswerRepository(db);
export const formAnswerAttachmentRepository =
  new FormAnswerAttachmentRepository(db);
export const submissionReviewRepository = new SubmissionReviewRepository(db);
