import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { QueryClient, QueryObserver } from '@tanstack/react-query';
import * as keys from '../src/shared/utils/query';

// Execute the actual success callbacks against a real QueryClient to catch
// missing invalidation, filter mismatches, and fire-and-forget refetches.
const modules = fileURLToPath(new URL('../src/modules/', import.meta.url));
for (const moduleName of readdirSync(modules)) {
  const path = `${modules}/${moduleName}/hooks/${moduleName}-mutations.ts`;
  let source: string;
  try {
    source = readFileSync(path, 'utf8');
  } catch {
    continue;
  }
  const file = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true);
  for (const fn of file.statements.filter(ts.isFunctionDeclaration)) {
    if (!fn.body || !fn.name) continue;
    const name = fn.name.text;
    let success: ts.ArrowFunction | undefined;
    const visit = (node: ts.Node) => {
      if (
        ts.isPropertyAssignment(node) &&
        node.name.getText(file) === 'onSuccess' &&
        ts.isArrowFunction(node.initializer)
      )
        success = node.initializer;
      ts.forEachChild(node, visit);
    };
    visit(fn);
    test(`${name} invalidates and awaits active refetches`, async () => {
      assert.ok(success, `${name} needs a success callback`);
      const client = new QueryClient({
        defaultOptions: { queries: { retry: false, staleTime: Infinity } },
      });
      const primary = moduleName.toUpperCase();
      const candidates = [
        [primary, 'LIST'],
        [primary, 'DETAIL', 'id'],
        keys.organizationKeys.members('organization'),
        keys.organizationKeys.sites('organization'),
        keys.roleKeys.all,
        keys.featureKeys.organization('organization'),
        keys.featureKeys.role('role'),
        keys.featureKeys.organizationRoles('organization'),
        keys.attendanceKeys.schedules('organization'),
        keys.attendanceKeys.scheduleByRole('organization', 'role'),
        keys.attendanceKeys.slots('schedule'),
        keys.attendanceKeys.memberLogs('member'),
        keys.leaveKeys.types('organization', true),
        keys.leaveKeys.types('organization', false),
        keys.leaveKeys.quotas('member', 2026),
        keys.locationKeys.organization('organization'),
        keys.formKeys.templates('organization'),
        keys.formKeys.template('template'),
        keys.formKeys.submissions('organization'),
        keys.formKeys.submission('submission'),
        keys.formKeys.plans('organization'),
        keys.formKeys.plans('organization', 'template'),
        keys.formKeys.plan('plan'),
        keys.formKeys.schedulePreview('plan'),
        keys.formKeys.occurrences('organization'),
        keys.formKeys.occurrence('id'),
        keys.formKeys.occurrenceAssignments('id'),
        keys.formKeys.assignment('id'),
        keys.formKeys.myAssignments('organization'),
        ['FORM', 'ASSIGNMENTS'],
        ['FORM', 'OCCURRENCE'],
        keys.formKeys.reviewQueue('organization'),
        keys.formKeys.reviewDetail('submission'),
      ];
      let refetched = 0;
      const disposers = candidates.map((queryKey) => {
        client.setQueryData(queryKey, 0);
        const observer = new QueryObserver(client, {
          queryKey,
          queryFn: async () => {
            await new Promise((resolve) => setTimeout(resolve, 5));
            refetched++;
            return 1;
          },
        });
        return observer.subscribe(() => {});
      });
      try {
        const env = {
          ...keys,
          locationKeys: keys.locationKeys,
          queryClient: client,
          client,
          toast: { success: () => {}, error: () => {} },
          organizationId: 'organization',
          roleId: 'role',
          scheduleId: 'schedule',
          memberId: 'member',
          submissionId: 'submission',
          planId: 'plan',
          templateId: 'template',
          slotId: 'slot',
          year: 2026,
        };
        const js = ts.transpile(`const callback = ${success.getText(file)};`, {
          target: ts.ScriptTarget.ES2022,
        });
        const callback = new Function(
          ...Object.keys(env),
          `${js}; return callback;`,
        )(...Object.values(env));
        await callback(
          { data: { status: 'late' } },
          {
            id: 'id',
            organizationId: 'organization',
            roleId: 'role',
            isEnabled: true,
            assignmentId: 'id',
            data: { formTemplateId: 'template' },
          },
        );
        assert.ok(
          refetched > 0,
          'callback must wait for related queries to refetch',
        );
        if (name === 'useLeaveTypeCreate' || name === 'useLeaveTypeUpdate') {
          assert.equal(
            client.getQueryData(keys.leaveKeys.types('organization', true)),
            1,
          );
          assert.equal(
            client.getQueryData(keys.leaveKeys.types('organization', false)),
            1,
          );
        }
        if (name === 'useScheduleCreate' || name === 'useScheduleUpdate')
          assert.equal(
            client.getQueryData(
              keys.attendanceKeys.scheduleByRole('organization', 'role'),
            ),
            1,
          );
        if (name === 'useUserUpdate')
          assert.equal(client.getQueryData(keys.userKeys.detail('id')), 1);
        if (name === 'useLeaveRequestReview')
          assert.equal(
            client.getQueryData(keys.attendanceKeys.memberLogs('member')),
            1,
          );
      } finally {
        disposers.forEach((dispose) => dispose());
        client.clear();
      }
    });
  }
}
