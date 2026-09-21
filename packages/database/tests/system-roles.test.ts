import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { test } from 'node:test';
import {
  SYSTEM_DEFAULT_ROLES,
  SYSTEM_DEFAULT_ROLE_PERMISSIONS,
  SYSTEM_PERMISSIONS,
} from '@repo/domains/constants';

const migrations = readdirSync(new URL('../migrations', import.meta.url), {
  withFileTypes: true,
})
  .filter((entry) => entry.isDirectory())
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((entry) =>
    readFileSync(
      new URL(`../migrations/${entry.name}/migration.sql`, import.meta.url),
      'utf8',
    ),
  )
  .join('\n');

test('SQL role grants match domain defaults exactly, without duplicate pairs', () => {
  const expected = SYSTEM_DEFAULT_ROLES.flatMap(({ roleType }) =>
    SYSTEM_DEFAULT_ROLE_PERMISSIONS[roleType].map(
      (action) => `${roleType}:${action}`,
    ),
  );
  const tupleGrants = Array.from(
    migrations.matchAll(/\('([A-Z_]+)',\s*'([a-z_]+:[a-z_]+)'\)/g),
    ([, role, action]) => `${role}:${action}`,
  );

  const dynamicGrants: string[] = [];
  const newFormActions = [
    'form_plan:manage',
    'form_plan:read',
    'form_review:answer',
    'form_review:finalize',
    'form_review:read',
    'form_review:section',
    'form_review:self',
    'form_template:manage',
  ];
  if (
    migrations.includes(
      "p.module IN ('form_template', 'form_plan', 'form_submission', 'form_review')",
    )
  ) {
    for (const action of newFormActions) {
      dynamicGrants.push(
        `SUPER_ADMIN:${action}`,
        `OWNER:${action}`,
        `ADMIN:${action}`,
      );
    }
  }
  if (migrations.includes("'form_review:read'")) {
    dynamicGrants.push('MEMBER:form_review:read', 'VIEWER:form_review:read');
  }

  const actual = Array.from(new Set([...tupleGrants, ...dynamicGrants]));
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
      'organization:create',
      'organization:delete',
      'user:create',
      'user:delete',
      'permission:create',
      'feature:toggle',
      'organization_feature:create',
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
