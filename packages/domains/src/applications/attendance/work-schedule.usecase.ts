import type { BaseUseCase } from '../../index';
import type { ISecurityContext } from '#constants/permissions';
import type { WorkSchedule, WorkShift } from '#entities/attendance';
import type {
  CreateWorkSchedule,
  CreateWorkShift,
  UpdateWorkSchedule,
  UpdateWorkShift,
} from '#schema/attendance';

// Work Schedule Contexts
export type ICreateWorkScheduleContext = ISecurityContext & {
  data: CreateWorkSchedule;
};
export type IUpdateWorkScheduleContext = ISecurityContext & {
  id: string;
  data: UpdateWorkSchedule;
};
export type IDeleteWorkScheduleContext = ISecurityContext & { id: string };
export type IGetWorkScheduleContext = ISecurityContext & { id: string };
export type IGetWorkSchedulesContext = ISecurityContext & {
  companyId: string;
};

// Work Schedule Contracts
export type ICreateWorkScheduleUseCase = BaseUseCase<
  ICreateWorkScheduleContext,
  WorkSchedule
>;
export type IUpdateWorkScheduleUseCase = BaseUseCase<
  IUpdateWorkScheduleContext,
  WorkSchedule
>;
export type IDeleteWorkScheduleUseCase = BaseUseCase<
  IDeleteWorkScheduleContext,
  void
>;
export type IGetWorkScheduleUseCase = BaseUseCase<
  IGetWorkScheduleContext,
  WorkSchedule | null
>;
export type IGetWorkSchedulesUseCase = BaseUseCase<
  IGetWorkSchedulesContext,
  WorkSchedule[]
>;

// Work Shift Contexts
export type ICreateWorkShiftContext = ISecurityContext & {
  data: CreateWorkShift;
};
export type IUpdateWorkShiftContext = ISecurityContext & {
  id: string;
  data: UpdateWorkShift;
};
export type IDeleteWorkShiftContext = ISecurityContext & { id: string };
export type IGetWorkShiftContext = ISecurityContext & { id: string };
export type IGetWorkShiftsContext = ISecurityContext & {
  workScheduleId: string;
};

// Work Shift Contracts
export type ICreateWorkShiftUseCase = BaseUseCase<
  ICreateWorkShiftContext,
  WorkShift
>;
export type IUpdateWorkShiftUseCase = BaseUseCase<
  IUpdateWorkShiftContext,
  WorkShift
>;
export type IDeleteWorkShiftUseCase = BaseUseCase<
  IDeleteWorkShiftContext,
  void
>;
export type IGetWorkShiftUseCase = BaseUseCase<
  IGetWorkShiftContext,
  WorkShift | null
>;
export type IGetWorkShiftsUseCase = BaseUseCase<
  IGetWorkShiftsContext,
  WorkShift[]
>;
