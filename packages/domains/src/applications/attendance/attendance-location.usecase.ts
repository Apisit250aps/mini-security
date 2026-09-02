import type { BaseUseCase } from '../../index';
import type { ISecurityContext } from '#constants/permissions';
import type {
  AttendanceLocation,
  CheckpointLocation,
} from '#entities/attendance';
import type {
  CreateAttendanceLocation,
  CreateCheckpointLocation,
  UpdateAttendanceLocation,
} from '#schema/attendance';

// Attendance Location Contexts
export type ICreateAttendanceLocationContext = ISecurityContext & {
  data: CreateAttendanceLocation;
};
export type IUpdateAttendanceLocationContext = ISecurityContext & {
  id: string;
  data: UpdateAttendanceLocation;
};
export type IDeleteAttendanceLocationContext = ISecurityContext & {
  id: string;
};
export type IGetAttendanceLocationContext = ISecurityContext & { id: string };
export type IGetAttendanceLocationsContext = ISecurityContext & {
  companyId: string;
};

// Attendance Location Contracts
export type ICreateAttendanceLocationUseCase = BaseUseCase<
  ICreateAttendanceLocationContext,
  AttendanceLocation
>;
export type IUpdateAttendanceLocationUseCase = BaseUseCase<
  IUpdateAttendanceLocationContext,
  AttendanceLocation
>;
export type IDeleteAttendanceLocationUseCase = BaseUseCase<
  IDeleteAttendanceLocationContext,
  void
>;
export type IGetAttendanceLocationUseCase = BaseUseCase<
  IGetAttendanceLocationContext,
  AttendanceLocation | null
>;
export type IGetAttendanceLocationsUseCase = BaseUseCase<
  IGetAttendanceLocationsContext,
  AttendanceLocation[]
>;

// Checkpoint Location Contexts
export type IAssignCheckpointLocationContext = ISecurityContext & {
  data: CreateCheckpointLocation;
};
export type IRemoveCheckpointLocationContext = ISecurityContext & {
  checkpointId: string;
  locationId: string;
};
export type IGetCheckpointLocationsContext = ISecurityContext & {
  checkpointId: string;
};

// Checkpoint Location Contracts
export type IAssignCheckpointLocationUseCase = BaseUseCase<
  IAssignCheckpointLocationContext,
  CheckpointLocation
>;
export type IRemoveCheckpointLocationUseCase = BaseUseCase<
  IRemoveCheckpointLocationContext,
  void
>;
export type IGetCheckpointLocationsUseCase = BaseUseCase<
  IGetCheckpointLocationsContext,
  CheckpointLocation[]
>;
