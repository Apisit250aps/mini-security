import {
  AssignRoleAttendancePolicyUseCase,
  CreateAttendanceCheckpointUseCase,
  CreateAttendancePolicyUseCase,
  DeleteAttendanceCheckpointUseCase,
  DeleteAttendancePolicyUseCase,
  GetAttendanceCheckpointUseCase,
  GetAttendanceCheckpointsUseCase,
  GetAttendancePoliciesUseCase,
  GetAttendancePolicyUseCase,
  GetRoleAttendancePoliciesUseCase,
  RemoveRoleAttendancePolicyUseCase,
  UpdateAttendanceCheckpointUseCase,
  UpdateAttendancePolicyUseCase,
} from '@repo/applications';
import {
  attendanceCheckpointRepository,
  attendancePolicyRepository,
  roleAttendancePolicyRepository,
} from '../../repositories';

export const createAttendancePolicyUseCase = new CreateAttendancePolicyUseCase(
  attendancePolicyRepository,
);
export const updateAttendancePolicyUseCase = new UpdateAttendancePolicyUseCase(
  attendancePolicyRepository,
);
export const deleteAttendancePolicyUseCase = new DeleteAttendancePolicyUseCase(
  attendancePolicyRepository,
);
export const getAttendancePolicyUseCase = new GetAttendancePolicyUseCase(
  attendancePolicyRepository,
);
export const getAttendancePoliciesUseCase = new GetAttendancePoliciesUseCase(
  attendancePolicyRepository,
);

export const createAttendanceCheckpointUseCase =
  new CreateAttendanceCheckpointUseCase(
    attendanceCheckpointRepository,
    attendancePolicyRepository,
  );
export const updateAttendanceCheckpointUseCase =
  new UpdateAttendanceCheckpointUseCase(attendanceCheckpointRepository);
export const deleteAttendanceCheckpointUseCase =
  new DeleteAttendanceCheckpointUseCase(attendanceCheckpointRepository);
export const getAttendanceCheckpointUseCase =
  new GetAttendanceCheckpointUseCase(attendanceCheckpointRepository);
export const getAttendanceCheckpointsUseCase =
  new GetAttendanceCheckpointsUseCase(attendanceCheckpointRepository);

export const assignRoleAttendancePolicyUseCase =
  new AssignRoleAttendancePolicyUseCase(
    roleAttendancePolicyRepository,
    attendancePolicyRepository,
  );
export const removeRoleAttendancePolicyUseCase =
  new RemoveRoleAttendancePolicyUseCase(roleAttendancePolicyRepository);
export const getRoleAttendancePoliciesUseCase =
  new GetRoleAttendancePoliciesUseCase(roleAttendancePolicyRepository);
