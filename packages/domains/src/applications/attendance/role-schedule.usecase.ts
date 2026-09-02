import type { BaseUseCase } from '../../index';
import type { ISecurityContext } from '#constants/permissions';
import type { RoleWorkSchedule } from '#entities/attendance';
import type {
  CreateRoleWorkSchedule,
  UpdateRoleWorkSchedule,
} from '#schema/attendance';

// Role Work Schedule Contexts
export type IAssignRoleWorkScheduleContext = ISecurityContext & {
  data: CreateRoleWorkSchedule;
};
export type IUpdateRoleWorkScheduleContext = ISecurityContext & {
  id: string;
  data: UpdateRoleWorkSchedule;
};
export type IDeleteRoleWorkScheduleContext = ISecurityContext & {
  id: string;
};
export type IGetRoleWorkScheduleContext = ISecurityContext & {
  id: string;
};
export type IGetRoleWorkSchedulesContext = ISecurityContext & {
  roleId: string;
};
export type IGetRoleWorkSchedulesByCompanyContext = ISecurityContext & {
  companyId: string;
};
export type IGetCurrentRoleWorkScheduleContext = ISecurityContext & {
  roleId: string;
  date?: Date;
};

// Role Work Schedule Contracts
export type IAssignRoleWorkScheduleUseCase = BaseUseCase<
  IAssignRoleWorkScheduleContext,
  RoleWorkSchedule
>;
export type IUpdateRoleWorkScheduleUseCase = BaseUseCase<
  IUpdateRoleWorkScheduleContext,
  RoleWorkSchedule
>;
export type IDeleteRoleWorkScheduleUseCase = BaseUseCase<
  IDeleteRoleWorkScheduleContext,
  void
>;
export type IGetRoleWorkScheduleUseCase = BaseUseCase<
  IGetRoleWorkScheduleContext,
  RoleWorkSchedule | null
>;
export type IGetRoleWorkSchedulesUseCase = BaseUseCase<
  IGetRoleWorkSchedulesContext,
  RoleWorkSchedule[]
>;
export type IGetRoleWorkSchedulesByCompanyUseCase = BaseUseCase<
  IGetRoleWorkSchedulesByCompanyContext,
  RoleWorkSchedule[]
>;
export type IGetCurrentRoleWorkScheduleUseCase = BaseUseCase<
  IGetCurrentRoleWorkScheduleContext,
  RoleWorkSchedule | null
>;
