import { companyMemberSchema } from '@repo/domains/schema/company';
import {
  permissionSchema,
  rolePermissionSchema,
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

const idParamSchema = permissionSchema.pick({ id: true });

const companyRolesParamSchema = companyMemberSchema.pick({ companyId: true });

const roleIdParamSchema = rolePermissionSchema.pick({ roleId: true });

const revokeParamSchema = rolePermissionSchema.pick({
  roleId: true,
  permissionId: true,
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
      ...this.securityContext(c),
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
        ...this.securityContext(c),
        companyId,
        userId: user?.id,
      });
      return this.success(c, 'Company roles retrieved', roles);
    },
  );

  public getRole = this.validator({ params: idParamSchema }, async (c) => {
    const { id } = c.get('params');
    const user = c.get('user');
    const role = await this.getRoleUseCase.execute({
      ...this.securityContext(c),
      id,
      userId: user?.id,
    });
    return this.success(c, 'Role retrieved successfully', role);
  });

  public createRole = this.validator({ body: createRoleSchema }, async (c) => {
    const body = c.get('body');
    const user = c.get('user');
    const role = await this.createRoleUseCase.execute({
      ...this.securityContext(c),
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
        ...this.securityContext(c),
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
    await this.deleteRoleUseCase.execute({
      ...this.securityContext(c),
      id,
      userId: user?.id,
    });
    return this.success(c, 'Role deleted successfully');
  });

  public getPermissions = async (c: Parameters<typeof this.success>[0]) => {
    const user = c.get('user');
    const permissions = await this.getPermissionsUseCase.execute({
      ...this.securityContext(c),
      userId: user?.id,
    });
    return this.success(c, 'Permissions retrieved successfully', permissions);
  };

  public getMyPermissions = this.validator(
    { query: companyRolesParamSchema.partial().optional() },
    async (c) => {
      const user = c.get('user');
      const query = c.get('query');
      const permissions = await this.getMyPermissionsUseCase.execute({
        ...this.securityContext(c),
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
        ...this.securityContext(c),
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
        ...this.securityContext(c),
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
      await this.deletePermissionUseCase.execute({
        ...this.securityContext(c),
        id,
        userId: user?.id,
      });
      return this.success(c, 'Permission deleted successfully');
    },
  );

  public getRolePermissions = this.validator(
    { params: roleIdParamSchema },
    async (c) => {
      const { roleId } = c.get('params');
      const user = c.get('user');
      const perms = await this.getRolePermissionsUseCase.execute({
        ...this.securityContext(c),
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
        ...this.securityContext(c),
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
        ...this.securityContext(c),
        roleId,
        permissionId,
        userId: user?.id,
      });
      return this.success(c, 'Permission revoked from role successfully');
    },
  );
}
