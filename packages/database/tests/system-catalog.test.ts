import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { SYSTEM_FEATURES, SYSTEM_PERMISSIONS } from '@repo/domains/constants';

const migration = readFileSync(
  new URL(
    '../migrations/20260912075209_seed_system_catalog/migration.sql',
    import.meta.url,
  ),
  'utf8',
);

test('system catalog has unique keys and valid feature references', () => {
  const codes = new Set<string>(SYSTEM_FEATURES.map((feature) => feature.code));
  assert.equal(codes.size, SYSTEM_FEATURES.length);
  assert.equal(
    new Set(SYSTEM_PERMISSIONS.map((permission) => permission.action)).size,
    SYSTEM_PERMISSIONS.length,
  );
  for (const permission of SYSTEM_PERMISSIONS) {
    assert.ok(codes.has(permission.featureCode));
    assert.equal(
      permission.module,
      permission.action.startsWith('leave_')
        ? 'leave'
        : permission.action.split(':')[0],
    );
  }
});

test('SQL seed matches the domain catalog', () => {
  const quote = (value: string) => `'${value.replaceAll("'", "''")}'`;
  for (const feature of SYSTEM_FEATURES) {
    assert.ok(
      migration.includes(
        [feature.code, feature.name, feature.description, feature.category]
          .map(quote)
          .join(', '),
      ),
    );
  }
  for (const permission of SYSTEM_PERMISSIONS) {
    assert.ok(
      migration.includes(
        [
          permission.action,
          permission.module,
          permission.description,
          permission.featureCode,
        ]
          .map(quote)
          .join(', '),
      ),
    );
  }
});

test('every permission used by application decorators is seeded', () => {
  const directory = fileURLToPath(
    new URL('../../applications/src/use-cases/', import.meta.url),
  );
  const actions = new Set<string>(
    SYSTEM_PERMISSIONS.map((permission) => permission.action),
  );
  for (const entry of readdirSync(directory, {
    recursive: true,
    withFileTypes: true,
  })) {
    if (!entry.isFile() || !entry.name.endsWith('.ts')) continue;
    const source = readFileSync(`${entry.parentPath}/${entry.name}`, 'utf8');
    for (const match of source.matchAll(
      /@RequirePermission(?:<[^;]*?>)?\(\s*'([^']+)'/g,
    )) {
      assert.ok(actions.has(match[1]!), `Missing permission: ${match[1]}`);
    }
  }
});
