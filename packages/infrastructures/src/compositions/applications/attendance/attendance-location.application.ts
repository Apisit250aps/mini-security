import {
  AssignCheckpointLocationUseCase,
  CreateAttendanceLocationUseCase,
  DeleteAttendanceLocationUseCase,
  GetAttendanceLocationUseCase,
  GetAttendanceLocationsUseCase,
  GetCheckpointLocationsUseCase,
  RemoveCheckpointLocationUseCase,
  UpdateAttendanceLocationUseCase,
} from '@repo/applications';
import {
  attendanceCheckpointRepository,
  attendanceLocationRepository,
  checkpointLocationRepository,
} from '../../repositories';

export const createAttendanceLocationUseCase =
  new CreateAttendanceLocationUseCase(attendanceLocationRepository);
export const updateAttendanceLocationUseCase =
  new UpdateAttendanceLocationUseCase(attendanceLocationRepository);
export const deleteAttendanceLocationUseCase =
  new DeleteAttendanceLocationUseCase(attendanceLocationRepository);
export const getAttendanceLocationUseCase = new GetAttendanceLocationUseCase(
  attendanceLocationRepository,
);
export const getAttendanceLocationsUseCase = new GetAttendanceLocationsUseCase(
  attendanceLocationRepository,
);

export const assignCheckpointLocationUseCase =
  new AssignCheckpointLocationUseCase(
    checkpointLocationRepository,
    attendanceCheckpointRepository,
    attendanceLocationRepository,
  );
export const removeCheckpointLocationUseCase =
  new RemoveCheckpointLocationUseCase(checkpointLocationRepository);
export const getCheckpointLocationsUseCase = new GetCheckpointLocationsUseCase(
  checkpointLocationRepository,
);
