import db from '@repo/database/db';
import {
  AccountRepository,
  AttendanceLogRepository,
  CheckInScheduleRepository,
  SiteRepository,
  OrganizationFeatureRepository,
  OrganizationMemberRepository,
  OrganizationRepository,
  FeatureRepository,
  FormAnswerAttachmentRepository,
  FormAnswerRepository,
  FormFieldOptionRepository,
  FormFieldRepository,
  FormSectionRepository,
  FormSubmissionContributorRepository,
  FormSubmissionRepository,
  FormTemplateRepository,
  FormVersionRepository,
  FormPlanRepository,
  FormPlanTargetRepository,
  FormPlanPeriodRepository,
  FormOccurrenceRepository,
  FormAssignmentRepository,
  FormReviewEntryRepository,
  LeaveQuotaRepository,
  LeaveRequestRepository,
  LeaveTypeRepository,
  LocationRepository,
  PermissionRepository,
  RoleFeatureRepository,
  RolePermissionRepository,
  RoleRepository,
  ScheduleSlotLocationRepository,
  ScheduleSlotRepository,
  SessionRepository,
  UserRepository,
} from '#repositories';

export const userRepository = new UserRepository(db);

export const organizationRepository = new OrganizationRepository(db);
export const siteRepository = new SiteRepository(db);
export const organizationMemberRepository = new OrganizationMemberRepository(
  db,
);

export const featureRepository = new FeatureRepository(db);
export const organizationFeatureRepository = new OrganizationFeatureRepository(
  db,
);
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
export const formVersionRepository = new FormVersionRepository(db);
export const formSectionRepository = new FormSectionRepository(db);
export const formFieldRepository = new FormFieldRepository(db);
export const formFieldOptionRepository = new FormFieldOptionRepository(db);
export const formPlanRepository = new FormPlanRepository(db);
export const formPlanTargetRepository = new FormPlanTargetRepository(db);
export const formPlanPeriodRepository = new FormPlanPeriodRepository(db);
export const formOccurrenceRepository = new FormOccurrenceRepository(db);
export const formAssignmentRepository = new FormAssignmentRepository(db);
export const formSubmissionRepository = new FormSubmissionRepository(db);
export const formSubmissionContributorRepository =
  new FormSubmissionContributorRepository(db);
export const formAnswerRepository = new FormAnswerRepository(db);
export const formAnswerAttachmentRepository =
  new FormAnswerAttachmentRepository(db);
export const formReviewEntryRepository = new FormReviewEntryRepository(db);

export const locationRepository = new LocationRepository(db);
export const scheduleSlotLocationRepository =
  new ScheduleSlotLocationRepository(db);
