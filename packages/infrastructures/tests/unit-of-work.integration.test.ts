import type { Site } from '@repo/domains/entities/organization';
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
  OrganizationRepository,
  SiteRepository,
} from '../src/repositories/organization.repo';
import { CreateOrganizationUseCase } from '../../applications/src/use-cases/organization/organization.usecase';

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
  const organizations = new OrganizationRepository(db);
  const sites = new SiteRepository(db);
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
          const organization = await organizations.create(data('commit'));
          await sites.create({
            organizationId: organization.id,
            name: 'HQ',
            isActive: true,
          });
          return organization;
        });
        assert.equal((await sites.findByOrganizationId(saved.id)).length, 1);
        await assert.rejects(
          uow.transaction(async () => {
            const organization = await organizations.create(data('rollback'));
            await sites.create({
              organizationId: organization.id,
              name: 'HQ',
              isActive: true,
            });
            throw new Error('abort');
          }),
          /abort/,
        );
        assert.equal(
          await organizations.findBySlug(data('rollback').slug),
          null,
        );
        assert.equal(resolveDatabase(db), db);
      },
    );

    await t.test(
      'the organization use case rolls back the organization if site creation fails',
      async () => {
        class FailingSites extends SiteRepository {
          override async create(): Promise<Site> {
            throw new Error('site failed');
          }
        }
        const useCase = new CreateOrganizationUseCase(
          uow,
          organizations,
          new FailingSites(db),
        );
        await assert.rejects(
          useCase.execute({
            data: data('usecase'),
            user: { id: randomUUID(), isAdmin: true, isActive: true },
          }),
          /site failed/,
        );
        assert.equal(
          await organizations.findBySlug(data('usecase').slug),
          null,
        );
      },
    );

    await t.test(
      'parallel async requests keep independent transaction contexts',
      async () => {
        const ready = barrier();
        const finish = barrier();
        const rollback = uow.transaction(async () => {
          const connection = resolveDatabase(db);
          await organizations.create(data('parallel-rollback'));
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
            organizations.create(data('parallel-commit')),
          );
        } finally {
          finish.resolve();
        }
        await rejected;
        assert.equal(
          await organizations.findBySlug(data('parallel-rollback').slug),
          null,
        );
        assert.ok(await organizations.findBySlug(data('parallel-commit').slug));
      },
    );

    await t.test(
      'nested failure rolls back to a savepoint and restores the parent context',
      async () => {
        await uow.transaction(async () => {
          const parent = resolveDatabase(db);
          await organizations.create(data('parent'));
          await assert.rejects(
            uow.transaction(async () => {
              assert.notEqual(resolveDatabase(db), parent);
              await organizations.create(data('child'));
              throw new Error('nested abort');
            }),
            /nested abort/,
          );
          assert.equal(resolveDatabase(db), parent);
          await organizations.create(data('after-child'));
        });
        assert.ok(await organizations.findBySlug(data('parent').slug));
        assert.ok(await organizations.findBySlug(data('after-child').slug));
        assert.equal(await organizations.findBySlug(data('child').slug), null);
      },
    );

    await t.test(
      'outer rollback includes a successfully completed nested unit',
      async () => {
        await assert.rejects(
          uow.transaction(async () => {
            await uow.transaction(() =>
              organizations.create(data('nested-success')),
            );
            throw new Error('outer abort');
          }),
          /outer abort/,
        );
        assert.equal(
          await organizations.findBySlug(data('nested-success').slug),
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
            const [organization] = await tx
              .insert(schema.organization)
              .values(data('form'))
              .returning();
            const [user] = await tx
              .insert(schema.user)
              .values({ name: 'Test', email: `${prefix}@example.test` })
              .returning();
            const [role] = await tx
              .insert(schema.role)
              .values({ organizationId: organization!.id, name: 'Member' })
              .returning();
            const [site] = await tx
              .insert(schema.site)
              .values({ organizationId: organization!.id, name: 'HQ' })
              .returning();
            const [member] = await tx
              .insert(schema.organizationMember)
              .values({
                organizationId: organization!.id,
                siteId: site!.id,
                roleId: role!.id,
                userId: user!.id,
              })
              .returning();
            const [template] = await tx
              .insert(schema.formTemplate)
              .values({
                organizationId: organization!.id,
                name: 'Form',
                createdBy: member!.id,
              })
              .returning();
            const [version] = await tx
              .insert(schema.formVersion)
              .values({
                organizationId: organization!.id,
                formTemplateId: template!.id,
                version: 1,
                title: 'Form',
                createdBy: member!.id,
              })
              .returning();
            const [section] = await tx
              .insert(schema.formSection)
              .values({
                organizationId: organization!.id,
                formVersionId: version!.id,
                title: 'Section',
              })
              .returning();
            const [field] = await tx
              .insert(schema.formField)
              .values({
                organizationId: organization!.id,
                formVersionId: version!.id,
                formSectionId: section!.id,
                label: 'Answer',
                type: 'TEXT',
              })
              .returning();
            const [submission] = await tx
              .insert(schema.formSubmission)
              .values({
                organizationId: organization!.id,
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
              organizationId: organization!.id,
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
        const organization = await organizations.create(data('conflict'));
        let reads = 0;
        const ready = barrier();
        const change = (name: string) =>
          uow.transaction(async () => {
            await organizations.findById(organization.id);
            if (++reads === 2) ready.resolve();
            await ready.promise;
            await organizations.update(organization.id, { name });
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
    await pool.query('DELETE FROM organization WHERE slug LIKE $1', [
      `${prefix}%`,
    ]);
    await pool.end();
  }
});
