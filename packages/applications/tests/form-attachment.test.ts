import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { IOrganizationMemberRepository } from '@repo/domains/repositories/organization';
import type {
  IFormSubmissionRepository,
  IFormAssignmentRepository,
  IFormOccurrenceRepository,
  IFormFieldRepository,
  IFormAnswerRepository,
  IFormAnswerAttachmentRepository,
  IFormSubmissionContributorRepository,
  IFormAttachmentStorage,
} from '@repo/domains/repositories/form';
import { FormAttachmentUseCase } from '../src/use-cases/form/form-attachment.usecase';
const ctx = {
  user: { id: 'user' },
  activeOrganizationId: 'organization',
  organizationId: 'organization',
  memberId: 'member',
  permissions: 'form_submission:update,form_submission:read',
  submissionId: 'submission',
  fieldId: 'field',
  expectedRevision: 1,
  bytes: new Uint8Array([1, 2, 3]),
  originalName: 'photo.png',
};
function fixture() {
  const submission = {
    id: 'submission',
    organizationId: 'organization',
    assignmentId: 'assignment',
    formVersionId: 'version',
    revision: 1,
    submittedAt: null as Date | null,
  };
  const attachment = {
    id: 'attachment',
    organizationId: 'organization',
    answerId: 'answer',
    storageKey: 'old-object',
  };
  let stored = 0,
    removedObjects = 0,
    rows = 0;
  let mimeType = 'image/png';
  let failCommit = false;
  const storage: IFormAttachmentStorage = {
    identifyMimeType: async () => mimeType,
    put: async () => {
      stored++;
      return 'new-object';
    },
    read: async () => new Uint8Array(),
    remove: async () => {
      removedObjects++;
    },
  };
  const usecase = new FormAttachmentUseCase(
    {
      transaction: async (work) => {
        const result = await work();
        if (failCommit) throw new Error('commit failed');
        return result;
      },
    },
    {
      findById: async () => submission,
      update: async (_id: string, value: object) => {
        Object.assign(submission, value);
        return submission;
      },
    } as IFormSubmissionRepository,
    {
      findById: async () => ({
        id: 'assignment',
        organizationId: 'organization',
        organizationMemberId: 'member',
        occurrenceId: 'occurrence',
        cancelledAt: null,
      }),
    } as IFormAssignmentRepository,
    {
      findById: async () => ({
        organizationId: 'organization',
        opensAt: new Date(0),
        cancelledAt: null,
      }),
    } as IFormOccurrenceRepository,
    {
      findById: async () => ({
        id: 'member',
        organizationId: 'organization',
        userId: 'user',
        isActive: true,
      }),
    } as IOrganizationMemberRepository,
    {
      findById: async () => ({
        id: 'field',
        formVersionId: 'version',
        type: 'IMAGE',
      }),
    } as IFormFieldRepository,
    {
      upsertAnswer: async () => ({ id: 'answer' }),
      findById: async () => ({ submissionId: 'submission' }),
    } as IFormAnswerRepository,
    {
      findById: async () => attachment,
      findByAnswerId: async () => [],
      create: async (data: object) => {
        rows++;
        return data;
      },
      delete: async () => {
        rows--;
      },
    } as IFormAnswerAttachmentRepository,
    { isContributor: async () => true } as IFormSubmissionContributorRepository,
    storage,
  );
  return {
    usecase,
    submission,
    attachment,
    stored: () => stored,
    removed: () => removedObjects,
    rows: () => rows,
    mime: (value: string) => {
      mimeType = value;
    },
    fail: () => {
      failCommit = true;
    },
  };
}
test('upload stores an attachment and advances concurrency revision', async () => {
  const f = fixture();
  await f.usecase.upload(ctx);
  assert.equal(f.rows(), 1);
  assert.equal(f.stored(), 1);
  assert.equal(f.submission.revision, 2);
});
test('image field rejects disguised document before storing object', async () => {
  const f = fixture();
  f.mime('application/pdf');
  await assert.rejects(f.usecase.upload(ctx), /Unsupported/);
  assert.equal(f.stored(), 0);
});
test('submitted attachments cannot change', async () => {
  const f = fixture();
  f.submission.submittedAt = new Date();
  await assert.rejects(f.usecase.upload(ctx), /immutable/);
  await assert.rejects(
    f.usecase.remove({ ...ctx, attachmentId: 'attachment' }),
    /immutable/,
  );
});
test('stale revision cannot upload', async () => {
  const f = fixture();
  await assert.rejects(
    f.usecase.upload({ ...ctx, expectedRevision: 2 }),
    /changed/,
  );
  assert.equal(f.stored(), 0);
});
test('transaction failure cleans up only newly uploaded object', async () => {
  const f = fixture();
  f.fail();
  await assert.rejects(f.usecase.upload(ctx), /commit failed/);
  assert.equal(f.removed(), 1);
});
test('removing a draft reference retains historical immutable object', async () => {
  const f = fixture();
  await f.usecase.remove({ ...ctx, attachmentId: 'attachment' });
  assert.equal(f.removed(), 0);
  assert.equal(f.submission.revision, 2);
});
test('download rejects cross-organization attachment', async () => {
  const f = fixture();
  f.attachment.organizationId = 'foreign';
  await assert.rejects(
    f.usecase.download({ ...ctx, attachmentId: 'attachment' }),
    /organization/,
  );
});
