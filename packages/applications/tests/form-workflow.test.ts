import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { IUnitOfWork } from '@repo/domains';
import type { FormField, FormSubmission } from '@repo/domains/entities/form';
import type { ICompanyMemberRepository } from '@repo/domains/repositories/company';
import type {
  IFormAssignmentRepository,
  IFormOccurrenceRepository,
  IFormSubmissionRepository,
  IFormSubmissionContributorRepository,
  IFormAnswerRepository,
  IFormFieldRepository,
  IFormReviewEntryRepository,
  IFormPlanRepository,
  IFormPlanTargetRepository,
  IFormVersionRepository,
  IFormPlanPeriodRepository,
  IFormAnswerAttachmentRepository,
} from '@repo/domains/repositories/form';
import {
  SaveFormSubmissionDraftUseCase,
  SubmitFormSubmissionUseCase,
  CreateCorrectionUseCase,
} from '../src/use-cases/form/form-submission.usecase';
import {
  GetReviewDetailUseCase,
  RecordAnswerReviewUseCase,
  ListReviewQueueUseCase,
} from '../src/use-cases/form/form-review-entry.usecase';
import { OpenDueOccurrencesUseCase } from '../src/use-cases/form/form-occurrence.usecase';
import {
  validateFormAnswer,
  validateFormFieldConfig,
} from '../src/use-cases/form/form-answer-validation';
import { calculateNextOccurrences } from '../src/use-cases/form/form-schedule.usecase';

const ctx = {
  user: { id: 'user' },
  memberId: 'member',
  companyId: 'company',
  activeCompanyId: 'company',
  permissions:
    'form_submission:read,form_submission:update,form_submission:submit,form_submission:create,form_review:read,form_review:answer,form_plan:manage',
  submissionId: 'submission',
  expectedRevision: 1,
};
function fixture() {
  let inside = false;
  const uow: IUnitOfWork = {
    transaction: async (work) => {
      inside = true;
      return work().finally(() => {
        inside = false;
      });
    },
  };
  const submission = {
    id: 'submission',
    companyId: 'company',
    assignmentId: 'assignment',
    formVersionId: 'version',
    revision: 1,
    submittedAt: null,
    startedBy: 'other',
    submittedBy: null,
  } as FormSubmission;
  const assignment = {
    id: 'assignment',
    companyId: 'company',
    occurrenceId: 'occurrence',
    roleId: 'role',
    companyMemberId: null,
    cancelledAt: null as Date | null,
  };
  const occurrence = {
    companyId: 'company',
    planId: 'plan',
    cancelledAt: null as Date | null,
    opensAt: new Date(0),
    dueAt: new Date(Date.now() + 86400000),
  };
  const member = {
    id: 'member',
    companyId: 'company',
    userId: 'user',
    roleId: 'role',
    isActive: true,
  };
  const field = {
    id: 'field',
    type: 'NUMBER',
    isRequired: true,
    label: 'Number',
    config: {},
  } as FormField;
  const submissions = {
    findById: async () => submission,
    update: async (_id: string, update: object) => {
      assert.ok(inside);
      Object.assign(submission, update);
      return submission;
    },
    findByCompanyId: async () => [submission],
  } as IFormSubmissionRepository;
  const assignments = {
    findById: async () => assignment,
  } as IFormAssignmentRepository;
  const occurrences = {
    findById: async () => occurrence,
  } as IFormOccurrenceRepository;
  const members = {
    findById: async (id: string) =>
      id === 'member' ? member : { ...member, id, userId: 'someone-else' },
  } as ICompanyMemberRepository;
  const contributors = {
    isContributor: async () => true,
    findMemberIdsForRevisionLineage: async () => [],
  } as IFormSubmissionContributorRepository;
  let writes = 0;
  const answers = {
    upsertAnswer: async () => {
      writes++;
    },
    findById: async () => ({ id: 'answer', submissionId: submission.id }),
    findBySubmissionId: async () => [{ fieldId: 'field', value: 1 }],
  } as unknown as IFormAnswerRepository;
  const fields = {
    findByVersionId: async () => [field],
  } as IFormFieldRepository;
  let finalized = false;
  const reviews = {
    findHeadByTarget: async () => (finalized ? { action: 'APPROVE' } : null),
    findBySubmissionId: async () => [],
    list: async () => [],
    create: async (data: object) => {
      assert.ok(inside);
      writes++;
      return data;
    },
  } as IFormReviewEntryRepository;
  const plans = {
    findById: async () => ({ reviewMode: 'NONE', latePolicy: 'ALLOW' }),
  } as IFormPlanRepository;
  return {
    uow,
    submission,
    assignment,
    occurrence,
    member,
    field,
    submissions,
    assignments,
    occurrences,
    members,
    contributors,
    answers,
    fields,
    reviews,
    plans,
    writes: () => writes,
    finalize: () => {
      finalized = true;
    },
    save: new SaveFormSubmissionDraftUseCase(
      uow,
      submissions,
      assignments,
      answers,
      contributors,
      members,
      occurrences,
      fields,
    ),
    submit: new SubmitFormSubmissionUseCase(
      uow,
      submissions,
      assignments,
      occurrences,
      plans,
      fields,
      answers,
      {} as IFormAnswerAttachmentRepository,
      contributors,
      members,
    ),
    correction: new CreateCorrectionUseCase(
      uow,
      submissions,
      reviews,
      answers,
      {} as IFormAnswerAttachmentRepository,
      contributors,
      assignments,
      occurrences,
      members,
    ),
  };
}

test('prior contributor cannot save after leaving assigned role', async () => {
  const f = fixture();
  f.member.roleId = 'another';
  await assert.rejects(
    f.save.execute({ ...ctx, answers: [{ fieldId: 'field', value: 12 }] }),
    /not assigned/,
  );
  assert.equal(f.writes(), 0);
});
for (const target of ['assignment', 'occurrence'] as const) {
  test(`cancelled ${target} rejects draft save and submit`, async () => {
    const f = fixture();
    f[target].cancelledAt = new Date();
    await assert.rejects(f.save.execute({ ...ctx, answers: [] }), /cancelled/);
    await assert.rejects(f.submit.execute(ctx), /cancelled/);
  });
}
test('inactive member cannot save', async () => {
  const f = fixture();
  f.member.isActive = false;
  await assert.rejects(f.save.execute({ ...ctx, answers: [] }), /membership/);
});
test('future occurrence cannot be edited', async () => {
  const f = fixture();
  f.occurrence.opensAt = new Date(Date.now() + 86400000);
  await assert.rejects(f.save.execute({ ...ctx, answers: [] }), /not open/);
});
test('correction cannot grant access to an unassigned actor', async () => {
  const f = fixture();
  f.submission.submittedAt = new Date();
  f.member.roleId = 'another';
  await assert.rejects(f.correction.execute(ctx), /not assigned/);
});
test('invalid NUMBER and foreign fields are rejected before writes', async () => {
  const f = fixture();
  await assert.rejects(
    f.save.execute({ ...ctx, answers: [{ fieldId: 'field', value: '12' }] }),
    /Invalid answer/,
  );
  await assert.rejects(
    f.save.execute({ ...ctx, answers: [{ fieldId: 'foreign', value: 12 }] }),
    /does not belong/,
  );
  assert.equal(f.writes(), 0);
});
test('valid draft increments revision and stale revision fails', async () => {
  const f = fixture();
  await f.save.execute({ ...ctx, answers: [{ fieldId: 'field', value: 12 }] });
  assert.equal(f.submission.revision, 2);
  await assert.rejects(f.save.execute({ ...ctx, answers: [] }), /conflict/);
});
for (const [type, value] of [
  ['NUMBER', '123'],
  ['BOOLEAN', 'false'],
  ['DATE', '2026-02-30'],
  ['SELECT', 'missing'],
  ['IMAGE', 'blob:fake'],
] as const) {
  test(`${type} rejects invalid persisted value`, async () => {
    await assert.rejects(
      validateFormAnswer(
        {
          type,
          label: 'question',
          config: { options: [{ value: 'yes', label: 'Yes' }] },
        } as FormField,
        value,
      ),
      /Invalid answer/,
    );
  });
}
test('required boolean false and number zero are valid', async () => {
  await validateFormAnswer(
    { type: 'BOOLEAN', isRequired: true } as FormField,
    false,
    true,
  );
  await validateFormAnswer(
    { type: 'NUMBER', isRequired: true } as FormField,
    0,
    true,
  );
});
test('SELECT rejects duplicate values', async () => {
  await assert.rejects(
    validateFormFieldConfig({
      type: 'SELECT',
      config: {
        options: [
          { value: 'x', label: 'X' },
          { value: 'x', label: 'Y' },
        ],
      },
    }),
    /unique/,
  );
});
test('review detail rejects another tenant before reading entries', async () => {
  const f = fixture();
  f.submission.companyId = 'foreign';
  const usecase = new GetReviewDetailUseCase(
    f.reviews,
    f.submissions,
    f.assignments,
    f.members,
  );
  await assert.rejects(usecase.execute(ctx), /company/);
});
test('assigned submitter can read return notes without review permission', async () => {
  const f = fixture();
  const usecase = new GetReviewDetailUseCase(
    f.reviews,
    f.submissions,
    f.assignments,
    f.members,
  );
  assert.deepEqual(
    await usecase.execute({ ...ctx, permissions: 'form_submission:read' }),
    [],
  );
});
test('review writes increment shared revision inside transaction and reject finalized/stale state', async () => {
  const f = fixture();
  f.submission.submittedAt = new Date();
  const usecase = new RecordAnswerReviewUseCase(
    f.uow,
    f.submissions,
    f.answers,
    f.reviews,
    f.contributors,
    f.members,
  );
  await usecase.execute({ ...ctx, answerId: 'answer', action: 'PASS' });
  assert.equal(f.submission.revision, 2);
  await assert.rejects(
    usecase.execute({ ...ctx, answerId: 'answer', action: 'PASS' }),
    /changed/,
  );
  f.finalize();
  await assert.rejects(
    usecase.execute({
      ...ctx,
      expectedRevision: 2,
      answerId: 'answer',
      action: 'PASS',
    }),
    /finalized/,
  );
});
test('review NONE is excluded from queue', async () => {
  const f = fixture();
  f.submission.submittedAt = new Date();
  assert.deepEqual(
    await new ListReviewQueueUseCase(
      f.submissions,
      f.reviews,
      f.assignments,
      f.occurrences,
      f.plans,
    ).execute(ctx),
    [],
  );
});

const schedule = {
  frequency: 'DAILY' as const,
  interval: 1,
  anchorLocalDate: '2026-01-01',
  openLocalTime: '08:00',
  dueOffset: { amount: 8, unit: 'ELAPSED_HOURS' as const },
};
test('schedule preview excludes past rounds', () => {
  const dates = calculateNextOccurrences(
    schedule,
    'Asia/Bangkok',
    new Date('2026-01-20T00:00:00Z'),
    3,
  );
  assert.deepEqual(
    dates.map((date) => date.toISOString()),
    [
      '2026-01-20T01:00:00.000Z',
      '2026-01-21T01:00:00.000Z',
      '2026-01-22T01:00:00.000Z',
    ],
  );
});
test('recurring opening progresses beyond seven rounds and deduplicates recipients', async () => {
  const plan = {
    id: 'plan',
    companyId: 'company',
    formTemplateId: 'template',
    fixedVersionId: 'version',
    effectiveFrom: new Date('2026-01-01T00:00:00Z'),
    effectiveUntil: null,
    missedPolicy: 'CATCH_UP',
    scheduleKind: 'RECURRING',
    scheduleConfig: schedule,
    timezone: 'Asia/Bangkok',
  };
  const existing = Array.from({ length: 7 }, (_, day) => ({
    opensAt: new Date(`2026-01-${String(day + 1).padStart(2, '0')}T01:00:00Z`),
    occurrenceKey: `old-${day}`,
  }));
  const created: Array<{ opensAt: Date }> = [];
  let assignments = 0;
  const usecase = new OpenDueOccurrencesUseCase(
    { transaction: async (work) => work() },
    {
      listPlans: async () => [plan],
      findById: async () => plan,
    } as IFormPlanRepository,
    {
      findByPlanId: async () => existing,
      create: async (data: { opensAt: Date }) => {
        created.push(data);
        return { ...data, id: String(created.length) };
      },
    } as unknown as IFormOccurrenceRepository,
    {
      create: async () => {
        assignments++;
      },
    } as unknown as IFormAssignmentRepository,
    {
      findByPlanId: async () => [
        { roleId: 'role', roleDistribution: 'PER_MEMBER' },
        { companyMemberId: 'member' },
      ],
    } as IFormPlanTargetRepository,
    {
      findById: async () => ({ id: 'version', status: 'PUBLISHED' }),
    } as IFormVersionRepository,
    {} as IFormPlanPeriodRepository,
    {
      findByCompanyId: async () => [
        { id: 'member', roleId: 'role', isActive: true },
        { id: 'inactive', roleId: 'role', isActive: false },
      ],
    } as ICompanyMemberRepository,
  );
  await usecase.execute(ctx);
  assert.equal(created[0]?.opensAt.toISOString(), '2026-01-08T01:00:00.000Z');
  assert.equal(created.length, 100);
  assert.equal(assignments, created.length);
});

test('self-review is denied even when the same user has a different historical member record', async () => {
  const f = fixture();
  f.submission.submittedAt = new Date();
  f.members.findById = async (id) => ({ ...f.member, id });
  const usecase = new RecordAnswerReviewUseCase(
    f.uow,
    f.submissions,
    f.answers,
    f.reviews,
    f.contributors,
    f.members,
  );
  await assert.rejects(
    usecase.execute({ ...ctx, answerId: 'answer', action: 'PASS' }),
    /Self-review/,
  );
});
