import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  SYSTEM_DEFAULT_ROLES,
  SYSTEM_DEFAULT_ROLE_PERMISSIONS,
  SYSTEM_PERMISSIONS,
} from '@repo/domains/constants';

const migration = readFileSync(
  new URL(
    '../migrations/20260912081723_seed_system_roles/migration.sql',
    import.meta.url,
  ),
  'utf8',
);

test('SQL role grants match domain defaults exactly, without duplicate pairs', () => {
  const expected = SYSTEM_DEFAULT_ROLES.flatMap(({ roleType }) =>
    SYSTEM_DEFAULT_ROLE_PERMISSIONS[roleType].map(
      (action) => `${roleType}:${action}`,
    ),
  );
  const actual = Array.from(
    migration.matchAll(/\('([A-Z_]+)', '([a-z_]+:[a-z_]+)'\)/g),
    ([, role, action]) => `${role}:${action}`,
  );
  assert.equal(new Set(actual).size, actual.length);
  assert.deepEqual(actual.sort(), expected.sort());
  const known = new Set<string>(
    SYSTEM_PERMISSIONS.map((permission) => permission.action),
  );
  for (const actions of Object.values(SYSTEM_DEFAULT_ROLE_PERMISSIONS)) {
    for (const action of actions) assert.ok(known.has(action));
  }
});

test('role defaults preserve platform, owner review and read-only boundaries', () => {
  const defaults = SYSTEM_DEFAULT_ROLE_PERMISSIONS;
  assert.deepEqual(
    [...defaults.SUPER_ADMIN].sort(),
    SYSTEM_PERMISSIONS.map((p) => p.action).sort(),
  );
  for (const action of defaults.VIEWER) {
    assert.ok(action.endsWith(':read') || action === 'role_feature:check');
  }
  for (const role of ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'] as const) {
    const actions: readonly string[] = defaults[role];
    for (const forbidden of [
      'company:create',
      'company:delete',
      'user:create',
      'user:delete',
      'permission:create',
      'feature:toggle',
      'company_feature:create',
    ]) {
      assert.ok(
        !actions.includes(forbidden),
        `${role} must not receive ${forbidden}`,
      );
    }
    assert.equal(actions.includes('form_submission:review'), role === 'OWNER');
  }
  assert.ok(defaults.MEMBER.includes('attendance:check_in'));
  assert.ok(defaults.MEMBER.includes('form_submission:submit'));
});
