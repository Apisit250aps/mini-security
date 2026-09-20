import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { QueryClient } from '@tanstack/react-query';
import { formKeys } from '../src/shared/utils/query';

// Run the real hook callbacks with a real query cache, without rendering React.
const source = readFileSync(
  new URL('../src/modules/form/hooks/form-mutations.ts', import.meta.url),
  'utf8',
);
const js = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
for (const kind of ['sections', 'fields'] as const) {
  test(`${kind}: optimistic order, rollback and settled invalidation`, async () => {
    const queryClient = new QueryClient();
    const notices: string[] = [];
    const service = async (options: { throwOnError: boolean }) => {
      assert.equal(options.throwOnError, true);
      throw new Error('save failed');
    };
    const exports = {} as Record<
      string,
      (...args: string[]) => {
        mutationFn: (body: object) => Promise<object>;
        onMutate: (body: object) => Promise<object>;
        onError: (error: Error, body: object, context: object) => void;
        onSettled: () => Promise<void>;
      }
    >;
    const requireMock = (name: string) => {
      if (name === '@tanstack/react-query')
        return {
          useQueryClient: () => queryClient,
          useMutation: (options: object) => options,
        };
      if (name === '@repo/client')
        return {
          formServicesReorderSections: service,
          formServicesReorderFields: service,
        };
      if (name === '@repo/ui/components/sonner')
        return { toast: { error: (message: string) => notices.push(message) } };
      if (name === '@/shared/utils' || name === '@/shared/utils/query')
        return { formKeys, getErrorMessage: (error: Error) => error.message };
      throw new Error(`Unexpected import ${name}`);
    };
    new Function('require', 'exports', js)(requireMock, exports);
    const mutation = exports[
      kind === 'sections' ? 'useFormSectionReorder' : 'useFormFieldReorder'
    ]!('company', 'template');
    const queryKey = formKeys.template('template');
    const items = [
      { id: 'a', sortOrder: 0 },
      { id: 'b', sortOrder: 1 },
    ];
    const previous = {
      draftVersion: { id: 'version' },
      sections: items,
      fields: items,
    };
    queryClient.setQueryData(queryKey, previous);
    const body = {
      formVersionId: 'version',
      items: [
        { id: 'b', sortOrder: 0 },
        { id: 'a', sortOrder: 1 },
      ],
    };
    const context = await mutation.onMutate(body);
    assert.deepEqual(
      queryClient
        .getQueryData<typeof previous>(queryKey)!
        [kind].map((item) => item.id),
      ['b', 'a'],
    );
    const other = kind === 'sections' ? 'fields' : 'sections';
    assert.deepEqual(
      queryClient.getQueryData<typeof previous>(queryKey)![other],
      items,
    );
    await assert.rejects(mutation.mutationFn(body), /save failed/);
    mutation.onError(new Error('save failed'), body, context);
    assert.deepEqual(queryClient.getQueryData(queryKey), previous);
    assert.deepEqual(notices, ['save failed']);
    await mutation.onSettled();
    assert.equal(queryClient.getQueryState(queryKey)?.isInvalidated, true);
    queryClient.clear();
  });
}
