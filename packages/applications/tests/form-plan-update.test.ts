import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { IUnitOfWork } from '@repo/domains';
import type {
  FormPlan,
  FormPlanTarget,
  FormPlanPeriod,
  FormTemplate,
  FormVersion,
} from '@repo/domains/entities/form';
import type { CompanyMember } from '@repo/domains/entities/company';
import type {
  IFormPlanRepository,
  IFormPlanTargetRepository,
  IFormPlanPeriodRepository,
  IFormTemplateRepository,
  IFormVersionRepository,
} from '@repo/domains/repositories/form';
import type { ICompanyMemberRepository } from '@repo/domains/repositories/company';
import {
  GetFormPlanUseCase,
  UpdateFormPlanUseCase,
} from '../src/use-cases/form/form-plan.usecase';

function fixture() {
  let insideTx = false;
  const uow: IUnitOfWork = {
    transaction: async (work) => {
      insideTx = true;
      try {
        return await work();
      } finally {
        insideTx = false;
      }
    },
  };

  const member: CompanyMember = {
    id: '01900000-0000-7000-8000-000000000001',
    companyId: '01900000-0000-7000-8000-000000000002',
    userId: '01900000-0000-7000-8000-000000000003',
    roleId: '01900000-0000-7000-8000-000000000004',
    isActive: true,
    joinedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const memberRepo: Partial<ICompanyMemberRepository> = {
    findById: async (id) => (id === member.id ? member : null),
    findByCompanyAndUser: async (companyId, userId) =>
      companyId === member.companyId && userId === member.userId ? member : null,
  };

  const template: FormTemplate = {
    id: '01900000-0000-7000-8000-000000000010',
    companyId: member.companyId,
    name: 'Safety Inspection',
    description: null,
    isActive: true,
    createdBy: member.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const templateRepo: Partial<IFormTemplateRepository> = {
    findByIdAndCompany: async (id, companyId) =>
      id === template.id && companyId === template.companyId ? template : null,
  };

  const versionRepo: Partial<IFormVersionRepository> = {
    findById: async () => null,
  };

  let plans: FormPlan[] = [];
  let targets: FormPlanTarget[] = [];
  let periods: FormPlanPeriod[] = [];

  const planRepo: Partial<IFormPlanRepository> = {
    findById: async (id) => plans.find((p) => p.id === id) || null,
    create: async (data) => {
      const p: FormPlan = {
        id: `plan-${plans.length + 1}`,
        companyId: data.companyId,
        formTemplateId: data.formTemplateId,
        supersedesPlanId: data.supersedesPlanId ?? null,
        name: data.name,
        scheduleKind: data.scheduleKind,
        scheduleConfig: data.scheduleConfig ?? null,
        timezone: data.timezone,
        fixedVersionId: data.fixedVersionId ?? null,
        reviewMode: data.reviewMode ?? 'OVERALL',
        latePolicy: data.latePolicy ?? 'DENY',
        missedPolicy: data.missedPolicy ?? 'SKIP',
        effectiveFrom: data.effectiveFrom ?? null,
        effectiveUntil: data.effectiveUntil ?? null,
        createdBy: data.createdBy,
        closedBy: data.closedBy ?? null,
        revision: data.revision ?? 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      plans.push(p);
      return p;
    },
    update: async (id, data) => {
      const idx = plans.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error('Not found');
      const updated: FormPlan = {
        ...plans[idx]!,
        ...data,
        updatedAt: new Date(),
      };
      plans[idx] = updated;
      return updated;
    },
  };

  const targetRepo: Partial<IFormPlanTargetRepository> = {
    findByPlanId: async (planId) => targets.filter((t) => t.planId === planId),
    create: async (data) => {
      const t: FormPlanTarget = {
        id: `target-${targets.length + 1}`,
        companyId: data.companyId,
        planId: data.planId,
        roleId: data.roleId ?? null,
        companyMemberId: data.companyMemberId ?? null,
        roleDistribution: data.roleDistribution ?? null,
        createdAt: new Date(),
      };
      targets.push(t);
      return t;
    },
    deleteByPlanId: async (planId) => {
      targets = targets.filter((t) => t.planId !== planId);
    },
  };

  const periodRepo: Partial<IFormPlanPeriodRepository> = {
    findByPlanId: async (planId) => periods.filter((p) => p.planId === planId),
    create: async (data) => {
      const pr: FormPlanPeriod = {
        id: `period-${periods.length + 1}`,
        companyId: data.companyId,
        planId: data.planId,
        opensAt: data.opensAt,
        dueAt: data.dueAt,
        createdAt: new Date(),
      };
      periods.push(pr);
      return pr;
    },
    deleteByPlanId: async (planId) => {
      periods = periods.filter((p) => p.planId !== planId);
    },
  };

  return {
    uow,
    member,
    memberRepo: memberRepo as ICompanyMemberRepository,
    template,
    templateRepo: templateRepo as IFormTemplateRepository,
    versionRepo: versionRepo as IFormVersionRepository,
    planRepo: planRepo as IFormPlanRepository,
    targetRepo: targetRepo as IFormPlanTargetRepository,
    periodRepo: periodRepo as IFormPlanPeriodRepository,
    plans,
    targets,
    periods,
  };
}

const baseCtx = {
  user: { id: '01900000-0000-7000-8000-000000000003' },
  memberId: '01900000-0000-7000-8000-000000000001',
  companyId: '01900000-0000-7000-8000-000000000002',
  activeCompanyId: '01900000-0000-7000-8000-000000000002',
  permissions: 'form_plan:read,form_plan:manage',
};

test('GetFormPlanUseCase returns plan with targets and periods', async () => {
  const f = fixture();
  const plan = await f.planRepo.create({
    companyId: f.member.companyId,
    formTemplateId: f.template.id,
    name: 'Inspection Plan A',
    scheduleKind: 'RECURRING',
    scheduleConfig: {
      frequency: 'DAILY',
      interval: 1,
      anchorLocalDate: '2026-09-01',
      openLocalTime: '08:00',
      dueOffset: { amount: 8, unit: 'ELAPSED_HOURS' },
    },
    timezone: 'Asia/Bangkok',
    createdBy: f.member.id,
  });

  await f.targetRepo.create({
    companyId: f.member.companyId,
    planId: plan.id,
    roleId: f.member.roleId,
    roleDistribution: 'SHARED',
  });

  const getUseCase = new GetFormPlanUseCase(f.planRepo, f.targetRepo, f.periodRepo);
  const detail = await getUseCase.execute({
    ...baseCtx,
    id: plan.id,
  });

  assert.equal(detail.plan.id, plan.id);
  assert.equal(detail.targets.length, 1);
  assert.equal(detail.targets[0]?.roleId, f.member.roleId);
  assert.equal(detail.periods.length, 0);
});

test('UpdateFormPlanUseCase updates draft plan in-place and replaces targets', async () => {
  const f = fixture();
  const draftPlan = await f.planRepo.create({
    companyId: f.member.companyId,
    formTemplateId: f.template.id,
    name: 'Original Draft Plan',
    scheduleKind: 'RECURRING',
    scheduleConfig: {
      frequency: 'DAILY',
      interval: 1,
      anchorLocalDate: '2026-09-01',
      openLocalTime: '08:00',
      dueOffset: { amount: 8, unit: 'ELAPSED_HOURS' },
    },
    timezone: 'Asia/Bangkok',
    effectiveFrom: null,
    createdBy: f.member.id,
  });

  await f.targetRepo.create({
    companyId: f.member.companyId,
    planId: draftPlan.id,
    companyMemberId: f.member.id,
  });

  const updateUseCase = new UpdateFormPlanUseCase(
    f.uow,
    f.planRepo,
    f.targetRepo,
    f.periodRepo,
    f.templateRepo,
    f.versionRepo,
    f.memberRepo,
  );

  const updated = await updateUseCase.execute({
    ...baseCtx,
    id: draftPlan.id,
    expectedRevision: 1,
    data: {
      name: 'Updated Draft Plan Name',
      timezone: 'Asia/Bangkok',
      scheduleKind: 'RECURRING',
      scheduleConfig: {
        frequency: 'WEEKLY',
        interval: 2,
        anchorLocalDate: '2026-09-01',
        openLocalTime: '09:00',
        dueOffset: { amount: 4, unit: 'ELAPSED_HOURS' },
      },
    },
    targets: [
      {
        roleId: f.member.roleId,
        roleDistribution: 'PER_MEMBER',
      },
    ],
  });

  assert.equal(updated.id, draftPlan.id);
  assert.equal(updated.name, 'Updated Draft Plan Name');
  assert.equal(updated.revision, 2);

  const updatedTargets = await f.targetRepo.findByPlanId(draftPlan.id);
  assert.equal(updatedTargets.length, 1);
  assert.equal(updatedTargets[0]?.roleId, f.member.roleId);
  assert.equal(updatedTargets[0]?.roleDistribution, 'PER_MEMBER');
});

test('UpdateFormPlanUseCase rejects mismatched revision token (optimistic lock)', async () => {
  const f = fixture();
  const plan = await f.planRepo.create({
    companyId: f.member.companyId,
    formTemplateId: f.template.id,
    name: 'Plan',
    scheduleKind: 'RECURRING',
    scheduleConfig: {
      frequency: 'DAILY',
      interval: 1,
      anchorLocalDate: '2026-09-01',
      openLocalTime: '08:00',
      dueOffset: { amount: 8, unit: 'ELAPSED_HOURS' },
    },
    timezone: 'Asia/Bangkok',
    createdBy: f.member.id,
  });

  const updateUseCase = new UpdateFormPlanUseCase(
    f.uow,
    f.planRepo,
    f.targetRepo,
    f.periodRepo,
    f.templateRepo,
    f.versionRepo,
    f.memberRepo,
  );

  await assert.rejects(
    () =>
      updateUseCase.execute({
        ...baseCtx,
        id: plan.id,
        expectedRevision: 99, // wrong revision
        data: { name: 'New Name' },
      }),
    /Optimistic concurrency check failed/,
  );
});

test('UpdateFormPlanUseCase creates successor revision when modifying active plan', async () => {
  const f = fixture();
  const activePlan = await f.planRepo.create({
    companyId: f.member.companyId,
    formTemplateId: f.template.id,
    name: 'Active Security Patrol',
    scheduleKind: 'RECURRING',
    scheduleConfig: {
      frequency: 'DAILY',
      interval: 1,
      anchorLocalDate: '2026-09-01',
      openLocalTime: '08:00',
      dueOffset: { amount: 8, unit: 'ELAPSED_HOURS' },
    },
    timezone: 'Asia/Bangkok',
    effectiveFrom: new Date('2026-09-01T00:00:00Z'),
    effectiveUntil: null,
    createdBy: f.member.id,
  });

  await f.targetRepo.create({
    companyId: f.member.companyId,
    planId: activePlan.id,
    roleId: f.member.roleId,
    roleDistribution: 'SHARED',
  });

  const updateUseCase = new UpdateFormPlanUseCase(
    f.uow,
    f.planRepo,
    f.targetRepo,
    f.periodRepo,
    f.templateRepo,
    f.versionRepo,
    f.memberRepo,
  );

  const successor = await updateUseCase.execute({
    ...baseCtx,
    id: activePlan.id,
    expectedRevision: 1,
    data: {
      name: 'Active Security Patrol - Revision 2',
      latePolicy: 'ALLOW',
    },
  });

  // Old plan should be closed
  const oldPlan = await f.planRepo.findById(activePlan.id);
  assert.ok(oldPlan?.effectiveUntil !== null);
  assert.equal(oldPlan?.closedBy, f.member.id);
  assert.equal(oldPlan?.revision, 2);

  // Successor plan should supersede old plan
  assert.notEqual(successor.id, activePlan.id);
  assert.equal(successor.supersedesPlanId, activePlan.id);
  assert.equal(successor.name, 'Active Security Patrol - Revision 2');
  assert.equal(successor.latePolicy, 'ALLOW');
  assert.ok(successor.effectiveFrom !== null);
  assert.equal(successor.effectiveUntil, null);

  // Successor plan should have copied targets
  const successorTargets = await f.targetRepo.findByPlanId(successor.id);
  assert.equal(successorTargets.length, 1);
  assert.equal(successorTargets[0]?.roleId, f.member.roleId);
});
