import db from '@repo/database/db';
import {
  AccountRepository,
  AttendanceCheckpointRepository,
  AttendanceLocationRepository,
  AttendanceLogRepository,
  AttendancePolicyRepository,
  AttendanceRecordRepository,
  CheckpointLocationRepository,
  CompanyBranchRepository,
  CompanyFeatureRepository,
  CompanyMemberRepository,
  CompanyRepository,
  FeatureRepository,
  LeaveRequestRepository,
  PermissionRepository,
  RoleAttendancePolicyRepository,
  RoleFeatureRepository,
  RolePermissionRepository,
  RoleRepository,
  RoleWorkScheduleRepository,
  SessionRepository,
  UserRepository,
  WorkScheduleRepository,
  WorkShiftRepository,
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

// Attendance Repositories
export const workScheduleRepository = new WorkScheduleRepository(db);
export const workShiftRepository = new WorkShiftRepository(db);
export const attendancePolicyRepository = new AttendancePolicyRepository(db);
export const attendanceCheckpointRepository =
  new AttendanceCheckpointRepository(db);
export const roleAttendancePolicyRepository =
  new RoleAttendancePolicyRepository(db);
export const attendanceLocationRepository = new AttendanceLocationRepository(
  db,
);
export const checkpointLocationRepository = new CheckpointLocationRepository(
  db,
);
export const roleWorkScheduleRepository = new RoleWorkScheduleRepository(db);
export const attendanceRecordRepository = new AttendanceRecordRepository(db);
export const attendanceLogRepository = new AttendanceLogRepository(db);
export const leaveRequestRepository = new LeaveRequestRepository(db);
