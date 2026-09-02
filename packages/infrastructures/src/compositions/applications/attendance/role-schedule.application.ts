import {
  AssignRoleWorkScheduleUseCase,
  DeleteRoleWorkScheduleUseCase,
  GetCurrentRoleWorkScheduleUseCase,
  GetRoleWorkSchedulesByCompanyUseCase,
  GetRoleWorkScheduleUseCase,
  UpdateRoleWorkScheduleUseCase,
} from '@repo/applications';
import {
  roleRepository,
  roleWorkScheduleRepository,
  workShiftRepository,
} from '../../repositories';

export const assignRoleWorkScheduleUseCase = new AssignRoleWorkScheduleUseCase(
  roleWorkScheduleRepository,
  roleRepository,
  workShiftRepository,
);
export const updateRoleWorkScheduleUseCase = new UpdateRoleWorkScheduleUseCase(
  roleWorkScheduleRepository,
  workShiftRepository,
);
export const deleteRoleWorkScheduleUseCase = new DeleteRoleWorkScheduleUseCase(
  roleWorkScheduleRepository,
);
export const getRoleWorkScheduleUseCase = new GetRoleWorkScheduleUseCase(
  roleWorkScheduleRepository,
);
export const getRoleWorkSchedulesByCompanyUseCase =
  new GetRoleWorkSchedulesByCompanyUseCase(roleWorkScheduleRepository);
export const getCurrentRoleWorkScheduleUseCase =
  new GetCurrentRoleWorkScheduleUseCase(roleWorkScheduleRepository);
