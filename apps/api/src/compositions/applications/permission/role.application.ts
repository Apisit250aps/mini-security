import {
  CreateRoleUseCase,
  DeleteRoleUseCase,
  GetRolesByCompanyUseCase,
  GetRoleUseCase,
  GetSystemDefaultRolesUseCase,
  UpdateRoleUseCase,
} from '@repo/applications';
import { roleRepository, userRepository } from '../../repositories';

export const createRoleUseCase = new CreateRoleUseCase(
  roleRepository,
  userRepository,
);
export const updateRoleUseCase = new UpdateRoleUseCase(
  roleRepository,
  userRepository,
);
export const deleteRoleUseCase = new DeleteRoleUseCase(
  roleRepository,
  userRepository,
);
export const getRoleUseCase = new GetRoleUseCase(roleRepository);
export const getRolesByCompanyUseCase = new GetRolesByCompanyUseCase(
  roleRepository,
  userRepository,
);
export const getSystemDefaultRolesUseCase = new GetSystemDefaultRolesUseCase(
  roleRepository,
  userRepository,
);
