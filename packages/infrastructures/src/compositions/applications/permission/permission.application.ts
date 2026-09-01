import {
  CreatePermissionUseCase,
  DeletePermissionUseCase,
  GetPermissionsUseCase,
  UpdatePermissionUseCase,
} from '@repo/applications';
import { permissionRepository } from '../../repositories';

export const createPermissionUseCase = new CreatePermissionUseCase(
  permissionRepository,
);
export const updatePermissionUseCase = new UpdatePermissionUseCase(
  permissionRepository,
);
export const deletePermissionUseCase = new DeletePermissionUseCase(
  permissionRepository,
);
export const getPermissionsUseCase = new GetPermissionsUseCase(
  permissionRepository,
);
