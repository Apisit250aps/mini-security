import type { BaseUseCase } from '../../index';
import type { ISecurityContext } from '#constants/permissions';
import type { MemberWorkSchedule } from '#entities/attendance';
import type {
  CreateMemberWorkSchedule,
  UpdateMemberWorkSchedule,
} from '#schema/attendance';

// Member Work Schedule Contexts
export type IAssignMemberWorkScheduleContext = ISecurityContext & {
  data: CreateMemberWorkSchedule;
};
export type IUpdateMemberWorkScheduleContext = ISecurityContext & {
  id: string;
  data: UpdateMemberWorkSchedule;
};
export type IDeleteMemberWorkScheduleContext = ISecurityContext & {
  id: string;
};
export type IGetMemberWorkScheduleContext = ISecurityContext & {
  id: string;
};
export type IGetMemberWorkSchedulesContext = ISecurityContext & {
  companyMemberId: string;
};
export type IGetCurrentMemberWorkScheduleContext = ISecurityContext & {
  companyMemberId: string;
  date?: Date;
};

// Member Work Schedule Contracts
export type IAssignMemberWorkScheduleUseCase = BaseUseCase<
  IAssignMemberWorkScheduleContext,
  MemberWorkSchedule
>;
export type IUpdateMemberWorkScheduleUseCase = BaseUseCase<
  IUpdateMemberWorkScheduleContext,
  MemberWorkSchedule
>;
export type IDeleteMemberWorkScheduleUseCase = BaseUseCase<
  IDeleteMemberWorkScheduleContext,
  void
>;
export type IGetMemberWorkScheduleUseCase = BaseUseCase<
  IGetMemberWorkScheduleContext,
  MemberWorkSchedule | null
>;
export type IGetMemberWorkSchedulesUseCase = BaseUseCase<
  IGetMemberWorkSchedulesContext,
  MemberWorkSchedule[]
>;
export type IGetCurrentMemberWorkScheduleUseCase = BaseUseCase<
  IGetCurrentMemberWorkScheduleContext,
  MemberWorkSchedule | null
>;
