import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ISecurityContext } from '@repo/domains/constants';
import type { IOrganizationMemberRepository } from '@repo/domains/repositories/organization';
import type { IRoleRepository } from '@repo/domains/repositories/permission';
import { PermissionGuard } from '../src/lib/guard';
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../src/lib/error';
import { RemoveOrganizationMemberUseCase } from '../src/use-cases/organization/organization-member.usecase';

const actor: ISecurityContext = {
  user: { id: 'actor', isAdmin: false, isActive: true },
  activeOrganizationId: 'organization-a',
  permissions: 'organization_member:delete',
};

for (const permissions of [
  'organization_member:delete',
  ' organization_member:delete , user:read ',
  'organization_member:*',
  '*',
]) {
  test(`allows matching permission: ${permissions}`, async () => {
    await PermissionGuard.requirePermission('organization_member:delete', {
      ...actor,
      permissions,
    });
  });
}
for (const permissions of [
  undefined,
  null,
  '',
  'organization_member:delete_other',
  'user:*',
]) {
  test(`denies missing permission: ${permissions}`, async () => {
    await assert.rejects(
      PermissionGuard.requirePermission('organization_member:delete', {
        ...actor,
        permissions,
      }),
      ForbiddenError,
    );
  });
}
test('requires an authenticated actor even with permissions or a target user ID', async () => {
  await assert.rejects(
    PermissionGuard.requirePermission('organization_member:delete', {
      userId: 'target',
      permissions: '*',
    }),
    UnauthorizedError,
  );
});
test('wildcards do not grant cross-organization or inactive-user access', async () => {
  await assert.rejects(
    PermissionGuard.requirePermission('organization_member:delete', {
      ...actor,
      permissions: '*',
      organizationId: 'organization-b',
    }),
    ForbiddenError,
  );
  await assert.rejects(
    PermissionGuard.requirePermission('organization_member:delete', {
      ...actor,
      user: { id: 'actor', isAdmin: true, isActive: false },
    }),
    ForbiddenError,
  );
});

function fixture({
  organizationId = 'organization-a',
  memberActive = true,
  owner = false,
  exists = true,
  roleExists = true,
} = {}) {
  let deleted = false;
  let reads = 0;
  const members = {
    findById: async () => {
      reads += 1;
      return exists ? { id: 'target', organizationId, roleId: 'role' } : null;
    },
    findByOrganizationAndUser: async () =>
      memberActive ? { isActive: true } : null,
    delete: async () => {
      deleted = true;
    },
  } as unknown as IOrganizationMemberRepository;
  const roles = {
    findById: async () =>
      roleExists
        ? { roleType: owner ? 'OWNER' : 'MEMBER', name: 'renamed role' }
        : null,
  } as unknown as IRoleRepository;
  return {
    useCase: new RemoveOrganizationMemberUseCase(members, roles),
    deleted: () => deleted,
    reads: () => reads,
  };
}
for (const options of [
  { organizationId: 'organization-b' },
  { memberActive: false },
  { owner: true },
]) {
  test(`rejects member removal: ${JSON.stringify(options)}`, async () => {
    const f = fixture(options);
    await assert.rejects(
      f.useCase.execute({
        ...actor,
        id: 'target',
        organizationId: 'organization-a',
      }),
      ForbiddenError,
    );
    assert.equal(f.deleted(), false);
  });
}
test('allows authorized member removal', async () => {
  const f = fixture();
  await f.useCase.execute({ ...actor, id: 'target' });
  assert.equal(f.deleted(), true);
  assert.equal(f.reads(), 1);
});
test('admin may remove a renamed OWNER in another organization without membership or permissions', async () => {
  const f = fixture({
    organizationId: 'organization-b',
    memberActive: false,
    owner: true,
  });
  await f.useCase.execute({
    ...actor,
    permissions: '',
    user: { id: 'admin', isAdmin: true },
    id: 'target',
  });
  assert.equal(f.deleted(), true);
  assert.equal(f.reads(), 1);
});
for (const options of [{ exists: false }, { roleExists: false }]) {
  test(`missing records fail closed: ${JSON.stringify(options)}`, async () => {
    const f = fixture(options);
    await assert.rejects(
      f.useCase.execute({ ...actor, id: 'target' }),
      NotFoundError,
    );
    assert.equal(f.deleted(), false);
  });
}
test('denies before accessing repositories when permission is missing', async () => {
  const f = fixture();
  await assert.rejects(
    f.useCase.execute({ ...actor, permissions: '', id: 'target' }),
    ForbiddenError,
  );
  assert.equal(f.deleted(), false);
  assert.equal(f.reads(), 0);
});

test('admin still receives not found for a missing resource', async () => {
  const f = fixture({ exists: false });
  await assert.rejects(
    f.useCase.execute({
      ...actor,
      user: { id: 'admin', isAdmin: true },
      id: 'target',
    }),
    NotFoundError,
  );
  assert.equal(f.deleted(), false);
  assert.equal(f.reads(), 1);
});
