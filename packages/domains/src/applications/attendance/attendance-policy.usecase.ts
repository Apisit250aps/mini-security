import type { BaseUseCase } from '../../index';
import type { ISecurityContext } from '#constants/permissions';
import type {
  AttendanceCheckpoint,
  AttendancePolicy,
  RoleAttendancePolicy,
} from '#entities/attendance';
import type {
  CreateAttendanceCheckpoint,
  CreateAttendancePolicy,
  CreateRoleAttendancePolicy,
  UpdateAttendanceCheckpoint,
  UpdateAttendancePolicy,
} from '#schema/attendance';

// Attendance Policy Contexts
export type ICreateAttendancePolicyContext = ISecurityContext & {
  data: CreateAttendancePolicy;
};
export type IUpdateAttendancePolicyContext = ISecurityContext & {
  id: string;
  data: UpdateAttendancePolicy;
};
export type IDeleteAttendancePolicyContext = ISecurityContext & { id: string };
export type IGetAttendancePolicyContext = ISecurityContext & { id: string };
export type IGetAttendancePoliciesContext = ISecurityContext & {
  companyId: string;
};

// Attendance Policy Contracts
export type ICreateAttendancePolicyUseCase = BaseUseCase<
  ICreateAttendancePolicyContext,
  AttendancePolicy
>;
export type IUpdateAttendancePolicyUseCase = BaseUseCase<
  IUpdateAttendancePolicyContext,
  AttendancePolicy
>;
export type IDeleteAttendancePolicyUseCase = BaseUseCase<
  IDeleteAttendancePolicyContext,
  void
>;
export type IGetAttendancePolicyUseCase = BaseUseCase<
  IGetAttendancePolicyContext,
  AttendancePolicy | null
>;
export type IGetAttendancePoliciesUseCase = BaseUseCase<
  IGetAttendancePoliciesContext,
  AttendancePolicy[]
>;

// Attendance Checkpoint Contexts
export type ICreateAttendanceCheckpointContext = ISecurityContext & {
  data: CreateAttendanceCheckpoint;
};
export type IUpdateAttendanceCheckpointContext = ISecurityContext & {
  id: string;
  data: UpdateAttendanceCheckpoint;
};
export type IDeleteAttendanceCheckpointContext = ISecurityContext & {
  id: string;
};
export type IGetAttendanceCheckpointContext = ISecurityContext & {
  id: string;
};
export type IGetAttendanceCheckpointsContext = ISecurityContext & {
  policyId: string;
};

// Attendance Checkpoint Contracts
export type ICreateAttendanceCheckpointUseCase = BaseUseCase<
  ICreateAttendanceCheckpointContext,
  AttendanceCheckpoint
>;
export type IUpdateAttendanceCheckpointUseCase = BaseUseCase<
  IUpdateAttendanceCheckpointContext,
  AttendanceCheckpoint
>;
export type IDeleteAttendanceCheckpointUseCase = BaseUseCase<
  IDeleteAttendanceCheckpointContext,
  void
>;
export type IGetAttendanceCheckpointUseCase = BaseUseCase<
  IGetAttendanceCheckpointContext,
  AttendanceCheckpoint | null
>;
export type IGetAttendanceCheckpointsUseCase = BaseUseCase<
  IGetAttendanceCheckpointsContext,
  AttendanceCheckpoint[]
>;

// Role Attendance Policy Contexts
export type IAssignRoleAttendancePolicyContext = ISecurityContext & {
  data: CreateRoleAttendancePolicy;
};
export type IRemoveRoleAttendancePolicyContext = ISecurityContext & {
  roleId: string;
  policyId: string;
};
export type IGetRoleAttendancePoliciesContext = ISecurityContext & {
  roleId: string;
};

// Role Attendance Policy Contracts
export type IAssignRoleAttendancePolicyUseCase = BaseUseCase<
  IAssignRoleAttendancePolicyContext,
  RoleAttendancePolicy
>;
export type IRemoveRoleAttendancePolicyUseCase = BaseUseCase<
  IRemoveRoleAttendancePolicyContext,
  void
>;
export type IGetRoleAttendancePoliciesUseCase = BaseUseCase<
  IGetRoleAttendancePoliciesContext,
  RoleAttendancePolicy[]
>;
