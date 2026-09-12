import type { CompanyBranch } from '@repo/domains/entities/company';
import type { FormSubmission } from '@repo/domains/entities/form';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { drizzle } from 'drizzle-orm/node-postgres';
import { relations } from '../../database/src/relations';
import { resolveDatabase } from '@repo/database/transaction';
import * as schema from '@repo/database/schema';
import {
  FormSubmissionRepository,
  FormAnswerRepository,
  FormSubmissionContributorRepository,
  FormTemplateRepository,
  FormTemplateRoleRepository,
} from '../src/repositories/form.repo';
import { SaveFormSubmissionDraftUseCase } from '../../applications/src/use-cases/form/form-submission.usecase';
import { AssignFormRolesUseCase } from '../../applications/src/use-cases/form/form-template.usecase';
import { UnitOfWork } from '../src/unit-of-work';
import {
  CompanyRepository,
  CompanyBranchRepository,
} from '../src/repositories/company.repo';
import { CreateCompanyUseCase } from '../../applications/src/use-cases/company/company.usecase';

function barrier() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

// This integration test runs directly with tsx, outside Turbo task caching.
// eslint-disable-next-line turbo/no-undeclared-env-vars
const url = process.env.TEST_DATABASE_URL;

// Run only against a disposable database with the current migrations applied.
test('PostgreSQL unit of work integration', { skip: !url }, async (t) => {
  const db = drizzle(url!, { relations: { ...relations } });
  const pool = db.$client;
  const uow = new UnitOfWork(db);
  const companies = new CompanyRepository(db);
  const branches = new CompanyBranchRepository(db);
  const prefix = `uow-${randomUUID()}`;
  const data = (name: string) => ({
    name,
    slug: `${prefix}-${name}`,
    isActive: true,
  });
  try {
    await t.test(
      'commits a result and rolls back writes across repositories on failure',
      async () => {
        const saved = await uow.transaction(async () => {
          const company = await companies.create(data('commit'));
          await branches.create({
            companyId: company.id,
            name: 'HQ',
            isActive: true,
          });
          return company;
        });
        assert.equal((await branches.findByCompanyId(saved.id)).length, 1);
        await assert.rejects(
          uow.transaction(async () => {
            const company = await companies.create(data('rollback'));
            await branches.create({
              companyId: company.id,
              name: 'HQ',
              isActive: true,
            });
            throw new Error('abort');
          }),
          /abort/,
        );
        assert.equal(await companies.findBySlug(data('rollback').slug), null);
        assert.equal(resolveDatabase(db), db);
      },
    );

    await t.test(
      'the company use case rolls back the company if branch creation fails',
      async () => {
        class FailingBranches extends CompanyBranchRepository {
          override async create(): Promise<CompanyBranch> {
            throw new Error('branch failed');
          }
        }
        const useCase = new CreateCompanyUseCase(
          uow,
          companies,
          new FailingBranches(db),
        );
        await assert.rejects(
          useCase.execute({
            data: data('usecase'),
            user: { id: randomUUID(), isAdmin: true, isActive: true },
          }),
          /branch failed/,
        );
        assert.equal(await companies.findBySlug(data('usecase').slug), null);
      },
    );

    await t.test(
      'parallel async requests keep independent transaction contexts',
      async () => {
        const ready = barrier();
        const finish = barrier();
        const rollback = uow.transaction(async () => {
          const connection = resolveDatabase(db);
          await companies.create(data('parallel-rollback'));
          ready.resolve();
          await finish.promise;
          assert.equal(resolveDatabase(db), connection);
          throw new Error('parallel abort');
        });
        const rejected = assert.rejects(rollback, /parallel abort/);
        await ready.promise;
        assert.equal(resolveDatabase(db), db);
        try {
          await uow.transaction(() =>
            companies.create(data('parallel-commit')),
          );
        } finally {
          finish.resolve();
        }
        await rejected;
        assert.equal(
          await companies.findBySlug(data('parallel-rollback').slug),
          null,
        );
        assert.ok(await companies.findBySlug(data('parallel-commit').slug));
      },
    );

    await t.test(
      'nested failure rolls back to a savepoint and restores the parent context',
      async () => {
        await uow.transaction(async () => {
          const parent = resolveDatabase(db);
          await companies.create(data('parent'));
          await assert.rejects(
            uow.transaction(async () => {
              assert.notEqual(resolveDatabase(db), parent);
              await companies.create(data('child'));
              throw new Error('nested abort');
            }),
            /nested abort/,
          );
          assert.equal(resolveDatabase(db), parent);
          await companies.create(data('after-child'));
        });
        assert.ok(await companies.findBySlug(data('parent').slug));
        assert.ok(await companies.findBySlug(data('after-child').slug));
        assert.equal(await companies.findBySlug(data('child').slug), null);
      },
    );

    await t.test(
      'outer rollback includes a successfully completed nested unit',
      async () => {
        await assert.rejects(
          uow.transaction(async () => {
            await uow.transaction(() =>
              companies.create(data('nested-success')),
            );
            throw new Error('outer abort');
          }),
          /outer abort/,
        );
        assert.equal(
          await companies.findBySlug(data('nested-success').slug),
          null,
        );
      },
    );

    await t.test(
      'form mutations roll back answers, contributors, revisions and replaced roles',
      async () => {
        const cleanup = new Error('rollback test fixtures');
        await assert.rejects(
          uow.transaction(async () => {
            const tx = resolveDatabase(db);
            const [company] = await tx
              .insert(schema.company)
              .values(data('form'))
              .returning();
            const [user] = await tx
              .insert(schema.user)
              .values({ name: 'Test', email: `${prefix}@example.test` })
              .returning();
            const [role] = await tx
              .insert(schema.role)
              .values({ companyId: company!.id, name: 'Member' })
              .returning();
            const [branch] = await tx
              .insert(schema.companyBranch)
              .values({ companyId: company!.id, name: 'HQ' })
              .returning();
            const [member] = await tx
              .insert(schema.companyMember)
              .values({
                companyId: company!.id,
                companyBranchId: branch!.id,
                roleId: role!.id,
                userId: user!.id,
              })
              .returning();
            const [template] = await tx
              .insert(schema.formTemplate)
              .values({
                companyId: company!.id,
                name: 'Form',
                createdBy: member!.id,
              })
              .returning();
            const [version] = await tx
              .insert(schema.formVersion)
              .values({
                companyId: company!.id,
                formTemplateId: template!.id,
                version: 1,
                title: 'Form',
                createdBy: member!.id,
              })
              .returning();
            const [section] = await tx
              .insert(schema.formSection)
              .values({
                companyId: company!.id,
                formVersionId: version!.id,
                title: 'Section',
              })
              .returning();
            const [field] = await tx
              .insert(schema.formField)
              .values({
                companyId: company!.id,
                formVersionId: version!.id,
                formSectionId: section!.id,
                label: 'Answer',
                type: 'TEXT',
              })
              .returning();
            const [submission] = await tx
              .insert(schema.formSubmission)
              .values({
                companyId: company!.id,
                formTemplateId: template!.id,
                formVersionId: version!.id,
                roleId: role!.id,
                startedBy: member!.id,
              })
              .returning();
            const actor = {
              user: { id: user!.id, isAdmin: true, isActive: true },
            };
            const answers = new FormAnswerRepository(db);
            const contributors = new FormSubmissionContributorRepository(db);
            const submissions = new FormSubmissionRepository(db);
            const roles = new FormTemplateRoleRepository(db);
            const originalRole = await roles.create({
              companyId: company!.id,
              formTemplateId: template!.id,
              roleId: role!.id,
              isEnabled: true,
            });
            const assign = new AssignFormRolesUseCase(
              uow,
              new FormTemplateRepository(db),
              roles,
            );
            await assert.rejects(
              assign.execute({
                ...actor,
                formTemplateId: template!.id,
                roleIds: [role!.id, randomUUID()],
              }),
            );
            assert.deepEqual(
              (await roles.findByTemplateId(template!.id)).map(
                (item) => item.id,
              ),
              [originalRole.id],
            );

            class FailingRevision extends FormSubmissionRepository {
              override async update(): Promise<FormSubmission> {
                throw new Error('revision failed');
              }
            }
            const save = new SaveFormSubmissionDraftUseCase(
              uow,
              new FailingRevision(db),
              answers,
              contributors,
            );
            const context = {
              ...actor,
              submissionId: submission!.id,
              expectedRevision: 1,
              memberId: member!.id,
              answers: [{ fieldId: field!.id, value: 'new answer' }],
            };
            await assert.rejects(save.execute(context), /revision failed/);
            assert.deepEqual(
              await answers.findBySubmissionId(submission!.id),
              [],
            );
            assert.deepEqual(
              await contributors.findBySubmissionId(submission!.id),
              [],
            );
            assert.equal(
              (await submissions.findById(submission!.id))!.revision,
              1,
            );

            const workingSave = new SaveFormSubmissionDraftUseCase(
              uow,
              submissions,
              answers,
              contributors,
            );
            assert.equal((await workingSave.execute(context)).revision, 2);
            assert.equal(
              (await answers.findBySubmissionId(submission!.id)).length,
              1,
            );
            assert.equal(
              (await contributors.findBySubmissionId(submission!.id)).length,
              1,
            );
            await assert.rejects(
              workingSave.execute(context),
              /Optimistic lock conflict/,
            );
            throw cleanup;
          }),
          (error) => error === cleanup,
        );
      },
    );

    await t.test(
      'concurrent read-modify-write conflicts abort instead of losing an update',
      async () => {
        const company = await companies.create(data('conflict'));
        let reads = 0;
        const ready = barrier();
        const change = (name: string) =>
          uow.transaction(async () => {
            await companies.findById(company.id);
            if (++reads === 2) ready.resolve();
            await ready.promise;
            await companies.update(company.id, { name });
          });
        const results = await Promise.allSettled([
          change('first'),
          change('second'),
        ]);
        assert.equal(
          results.filter((result) => result.status === 'fulfilled').length,
          1,
        );
        assert.equal(
          results.filter((result) => result.status === 'rejected').length,
          1,
        );
      },
    );
  } finally {
    await pool.query('DELETE FROM company WHERE slug LIKE $1', [`${prefix}%`]);
    await pool.end();
  }
});
