import { z } from 'zod';
import {
  createPermissionSchema,
  createRolePermissionSchema,
  createRoleSchema,
  updatePermissionSchema,
  updateRoleSchema,
} from '@repo/domains/schema/permission';
import type {
  AssignPermissionToRoleUseCase,
  CreatePermissionUseCase,
  CreateRoleUseCase,
  DeletePermissionUseCase,
  DeleteRoleUseCase,
  GetMyPermissionsUseCase,
  GetPermissionsUseCase,
  GetRolePermissionsUseCase,
  GetRolesByCompanyUseCase,
  GetRoleUseCase,
  GetSystemDefaultRolesUseCase,
  RevokePermissionFromRoleUseCase,
  UpdatePermissionUseCase,
  UpdateRoleUseCase,
} from '@repo/applications';
import Controller from './base.controller';

const idParamSchema = z.object({
  id: z.string().uuid(),
});

const companyRolesParamSchema = z.object({
  companyId: z.string().uuid(),
});

const roleIdParamSchema = z.object({
  roleId: z.string().uuid(),
});

const revokeParamSchema = z.object({
  roleId: z.string().uuid(),
  permissionId: z.string().uuid(),
});

export class PermissionController extends Controller {
  constructor(
    private readonly createRoleUseCase: CreateRoleUseCase,
    private readonly updateRoleUseCase: UpdateRoleUseCase,
    private readonly deleteRoleUseCase: DeleteRoleUseCase,
    private readonly getRoleUseCase: GetRoleUseCase,
    private readonly getRolesByCompanyUseCase: GetRolesByCompanyUseCase,
    private readonly getSystemDefaultRolesUseCase: GetSystemDefaultRolesUseCase,
    private readonly createPermissionUseCase: CreatePermissionUseCase,
    private readonly updatePermissionUseCase: UpdatePermissionUseCase,
    private readonly deletePermissionUseCase: DeletePermissionUseCase,
    private readonly getPermissionsUseCase: GetPermissionsUseCase,
    private readonly assignPermissionToRoleUseCase: AssignPermissionToRoleUseCase,
    private readonly revokePermissionFromRoleUseCase: RevokePermissionFromRoleUseCase,
    private readonly getRolePermissionsUseCase: GetRolePermissionsUseCase,
    private readonly getMyPermissionsUseCase: GetMyPermissionsUseCase,
  ) {
    super();
  }

  public getSystemDefaultRoles = async (
    c: Parameters<typeof this.success>[0],
  ) => {
    const user = c.get('user');
    const roles = await this.getSystemDefaultRolesUseCase.execute({
      userId: user?.id,
    });
    return this.success(c, 'System default roles retrieved', roles);
  };

  public getCompanyRoles = this.validator(
    { params: companyRolesParamSchema },
    async (c) => {
      const { companyId } = c.get('params');
      const user = c.get('user');
      const roles = await this.getRolesByCompanyUseCase.execute({
        companyId,
        userId: user?.id,
      });
      return this.success(c, 'Company roles retrieved', roles);
    },
  );

  public getRole = this.validator({ params: idParamSchema }, async (c) => {
    const { id } = c.get('params');
    const user = c.get('user');
    const role = await this.getRoleUseCase.execute({ id, userId: user?.id });
    return this.success(c, 'Role retrieved successfully', role);
  });

  public createRole = this.validator({ body: createRoleSchema }, async (c) => {
    const body = c.get('body');
    const user = c.get('user');
    const role = await this.createRoleUseCase.execute({
      data: body,
      userId: user?.id,
      companyId: body.companyId ?? undefined,
    });
    return this.created(c, 'Role created successfully', role);
  });

  public updateRole = this.validator(
    { params: idParamSchema, body: updateRoleSchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      const user = c.get('user');
      const role = await this.updateRoleUseCase.execute({
        id,
        data: body,
        userId: user?.id,
      });
      return this.success(c, 'Role updated successfully', role);
    },
  );

  public deleteRole = this.validator({ params: idParamSchema }, async (c) => {
    const { id } = c.get('params');
    const user = c.get('user');
    await this.deleteRoleUseCase.execute({ id, userId: user?.id });
    return this.success(c, 'Role deleted successfully');
  });

  public getPermissions = async (c: Parameters<typeof this.success>[0]) => {
    const user = c.get('user');
    const permissions = await this.getPermissionsUseCase.execute({
      userId: user?.id,
    });
    return this.success(c, 'Permissions retrieved successfully', permissions);
  };

  public getMyPermissions = this.validator(
    { query: z.object({ companyId: z.string().uuid().optional() }).optional() },
    async (c) => {
      const user = c.get('user');
      const query = c.get('query') as { companyId?: string } | undefined;
      const permissions = await this.getMyPermissionsUseCase.execute({
        userId: user?.id,
        companyId: query?.companyId,
      });
      return this.success(c, 'Current user permissions retrieved', permissions);
    },
  );

  public createPermission = this.validator(
    { body: createPermissionSchema },
    async (c) => {
      const body = c.get('body');
      const user = c.get('user');
      const permission = await this.createPermissionUseCase.execute({
        data: body,
        userId: user?.id,
      });
      return this.created(c, 'Permission created successfully', permission);
    },
  );

  public updatePermission = this.validator(
    { params: idParamSchema, body: updatePermissionSchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      const user = c.get('user');
      const permission = await this.updatePermissionUseCase.execute({
        id,
        data: body,
        userId: user?.id,
      });
      return this.success(c, 'Permission updated successfully', permission);
    },
  );

  public deletePermission = this.validator(
    { params: idParamSchema },
    async (c) => {
      const { id } = c.get('params');
      const user = c.get('user');
      await this.deletePermissionUseCase.execute({ id, userId: user?.id });
      return this.success(c, 'Permission deleted successfully');
    },
  );

  public getRolePermissions = this.validator(
    { params: roleIdParamSchema },
    async (c) => {
      const { roleId } = c.get('params');
      const user = c.get('user');
      const perms = await this.getRolePermissionsUseCase.execute({
        roleId,
        userId: user?.id,
      });
      return this.success(c, 'Role permissions retrieved', perms);
    },
  );

  public assignPermission = this.validator(
    { body: createRolePermissionSchema },
    async (c) => {
      const body = c.get('body');
      const user = c.get('user');
      const result = await this.assignPermissionToRoleUseCase.execute({
        data: body,
        userId: user?.id,
      });
      return this.created(
        c,
        'Permission assigned to role successfully',
        result,
      );
    },
  );

  public revokePermission = this.validator(
    { params: revokeParamSchema },
    async (c) => {
      const { roleId, permissionId } = c.get('params');
      const user = c.get('user');
      await this.revokePermissionFromRoleUseCase.execute({
        roleId,
        permissionId,
        userId: user?.id,
      });
      return this.success(c, 'Permission revoked from role successfully');
    },
  );
}
