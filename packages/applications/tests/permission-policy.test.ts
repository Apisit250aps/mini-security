import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  isTenantConfigurablePermission,
  SYSTEM_PERMISSION_MODULES,
  SYSTEM_RESTRICTED_ACTIONS,
  LEGACY_DEPRECATED_MODULES,
} from '@repo/domains/constants';
import { AssignPermissionToRoleUseCase } from '../src/use-cases/permission/role-permission.usecase';
import { ValidationError } from '../src/lib/error';
import type { CreateRolePermission } from '@repo/domains/schema/permission';
import type {
  IRolePermissionRepository,
  IRoleRepository,
  IPermissionRepository,
} from '@repo/domains/repositories/permission';

test('isTenantConfigurablePermission correctly identifies system vs business permissions', () => {
  // System modules should return false
  for (const module of SYSTEM_PERMISSION_MODULES) {
    assert.strictEqual(
      isTenantConfigurablePermission({ module, action: `${module}:read` }),
      false,
      `Module ${module} should not be tenant configurable`,
    );
  }

  // System restricted actions should return false
  for (const action of SYSTEM_RESTRICTED_ACTIONS) {
    assert.strictEqual(
      isTenantConfigurablePermission({ module: action.split(':')[0], action }),
      false,
      `Action ${action} should not be tenant configurable`,
    );
  }

  // Legacy deprecated modules should return false
  for (const module of LEGACY_DEPRECATED_MODULES) {
    assert.strictEqual(
      isTenantConfigurablePermission({ module, action: `${module}:read` }),
      false,
      `Legacy module ${module} should not be tenant configurable`,
    );
  }

  // Valid business permissions should return true
  assert.strictEqual(
    isTenantConfigurablePermission({
      module: 'attendance',
      action: 'attendance:check_in',
    }),
    true,
  );
  assert.strictEqual(
    isTenantConfigurablePermission({
      module: 'leave',
      action: 'leave_request:create',
    }),
    true,
  );
  assert.strictEqual(
    isTenantConfigurablePermission({
      module: 'company_member',
      action: 'company_member:read',
    }),
    true,
  );
  assert.strictEqual(
    isTenantConfigurablePermission({
      module: 'company',
      action: 'company:read',
    }),
    true,
  );
  assert.strictEqual(
    isTenantConfigurablePermission({
      module: 'company',
      action: 'company:update',
    }),
    true,
  );
  assert.strictEqual(
    isTenantConfigurablePermission({
      module: 'form_template',
      action: 'form_template:read',
    }),
    true,
  );
});

test('AssignPermissionToRoleUseCase rejects assigning system permissions to tenant roles', async () => {
  const fakeRoleRepo = {
    findById: async (id: string) => ({
      id,
      name: 'Custom HR',
      companyId: 'company-1',
      roleType: 'MEMBER',
      isSystemDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  } as unknown as IRoleRepository;

  const fakePermRepo = {
    findById: async (id: string) => {
      if (id === '01955f24-0000-7000-8000-000000000002') {
        return {
          id,
          module: 'feature',
          action: 'feature:create',
          description: 'Create feature',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      return {
        id,
        module: 'attendance',
        action: 'attendance:check_in',
        description: 'Check in',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
  } as unknown as IPermissionRepository;

  const fakeRolePermRepo = {
    create: async (data: CreateRolePermission) => ({
      id: 'rp-1',
      roleId: data.roleId,
      permissionId: data.permissionId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  } as unknown as IRolePermissionRepository;

  const useCase = new AssignPermissionToRoleUseCase(
    fakeRolePermRepo,
    fakeRoleRepo,
    fakePermRepo,
  );

  // Attempting to assign system permission without isAdmin should reject with ValidationError
  await assert.rejects(
    useCase.execute({
      permissions: 'permission:assign',
      user: { id: 'user-1', isAdmin: false },
      data: {
        roleId: '01955f24-0000-7000-8000-000000000001',
        permissionId: '01955f24-0000-7000-8000-000000000002',
      },
    }),
    ValidationError,
  );
});
