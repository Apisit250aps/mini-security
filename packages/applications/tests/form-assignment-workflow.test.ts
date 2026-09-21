import assert from 'node:assert/strict';
import { test } from 'node:test';
import type {
  FormAssignment,
  FormOccurrence,
  FormPlan,
  FormTemplate,
  FormSubmission,
  FormReviewEntry,
} from '@repo/domains/entities/form';
import type { OrganizationMember } from '@repo/domains/entities/organization';
import type { User } from '@repo/domains/entities/user';
import type {
  IFormAssignmentRepository,
  IFormOccurrenceRepository,
  IFormPlanRepository,
  IFormSubmissionRepository,
  IFormTemplateRepository,
  IFormReviewEntryRepository,
} from '@repo/domains/repositories/form';
import type { IOrganizationMemberRepository } from '@repo/domains/repositories/organization';
import type { IUserRepository } from '@repo/domains/repositories/user';
import { ListMyAssignmentsUseCase } from '../src/use-cases/form/form-assignment.usecase';
import { ListFormSubmissionsUseCase } from '../src/use-cases/form/form-submission.usecase';

const ctx = {
  user: { id: 'u1', name: 'Inspector Somchai' },
  memberId: 'm1',
  organizationId: 'c1',
  activeOrganizationId: 'c1',
  permissions:
    'form_submission:read,form_submission:create,form_submission:update,form_plan:read,form_plan:manage',
};

test('ListMyAssignmentsUseCase computes NOT_STARTED and canStart', async () => {
  const assignment: FormAssignment = {
    id: 'a1',
    organizationId: 'c1',
    occurrenceId: 'occ1',
    formVersionId: 'fv1',
    roleId: null,
    organizationMemberId: 'm1',
    replacesAssignmentId: null,
    assignedBy: 'u1',
    cancelledAt: null,
    cancelReason: null,
    revision: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const occurrence: FormOccurrence = {
    id: 'occ1',
    organizationId: 'c1',
    planId: 'p1',
    formTemplateId: 't1',
    formVersionId: 'fv1',
    occurrenceKey: 'key1',
    opensAt: new Date(Date.now() - 3600000), // 1 hr ago
    dueAt: new Date(Date.now() + 3600000), // 1 hr later
    cancelledAt: null,
    cancelReason: null,
    revision: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const plan: FormPlan = {
    id: 'p1',
    organizationId: 'c1',
    formTemplateId: 't1',
    name: 'Daily Safety Patrol',
    scheduleKind: 'MANUAL',
    scheduleConfig: {},
    timezone: 'Asia/Bangkok',
    fixedVersionId: null,
    reviewMode: 'OVERALL',
    latePolicy: 'DENY',
    missedPolicy: 'AUTO_CANCEL',
    effectiveFrom: new Date(),
    effectiveUntil: null,
    revision: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const member: OrganizationMember = {
    id: 'm1',
    organizationId: 'c1',
    siteId: 'b1',
    userId: 'u1',
    roleId: 'r1',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const assignmentRepo: Partial<IFormAssignmentRepository> = {
    findByMemberId: async () => [assignment],
    findByRoleId: async () => [],
    findById: async () => assignment,
  };

  const memberRepo: Partial<IOrganizationMemberRepository> = {
    findById: async () => member,
  };

  const occurrenceRepo: Partial<IFormOccurrenceRepository> = {
    findById: async () => occurrence,
  };

  const planRepo: Partial<IFormPlanRepository> = {
    findById: async () => plan,
  };

  const templateRepo: Partial<IFormTemplateRepository> = {
    findById: async () =>
      ({ id: 't1', name: 'Safety Checklist v1' }) as unknown as FormTemplate,
  };

  const submissionRepo: Partial<IFormSubmissionRepository> = {
    findByAssignmentIds: async () => [],
  };

  const reviewRepo: Partial<IFormReviewEntryRepository> = {
    findHeadFinalBySubmissionIds: async () => [],
  };

  const usecase = new ListMyAssignmentsUseCase(
    assignmentRepo as IFormAssignmentRepository,
    memberRepo as IOrganizationMemberRepository,
    occurrenceRepo as IFormOccurrenceRepository,
    templateRepo as IFormTemplateRepository,
    undefined,
    planRepo as IFormPlanRepository,
    submissionRepo as IFormSubmissionRepository,
    reviewRepo as IFormReviewEntryRepository,
  );

  const results = await usecase.execute(ctx);
  assert.equal(results.length, 1);
  const item = results[0];
  assert.equal(item.planName, 'Daily Safety Patrol');
  assert.equal(item.templateName, 'Safety Checklist v1');
  assert.equal(item.workflowStatus, 'NOT_STARTED');
  assert.equal(item.isOverdue, false);
  assert.equal(item.availableActions?.canStart, true);
  assert.equal(item.availableActions?.canContinue, false);
});

test('ListMyAssignmentsUseCase enforces latePolicy DENY vs ALLOW', async () => {
  const assignment: FormAssignment = {
    id: 'a1',
    organizationId: 'c1',
    occurrenceId: 'occ1',
    formVersionId: 'fv1',
    roleId: null,
    organizationMemberId: 'm1',
    replacesAssignmentId: null,
    assignedBy: 'u1',
    cancelledAt: null,
    cancelReason: null,
    revision: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const overdueOccurrence: FormOccurrence = {
    id: 'occ1',
    organizationId: 'c1',
    planId: 'p1',
    formTemplateId: 't1',
    formVersionId: 'fv1',
    occurrenceKey: 'key1',
    opensAt: new Date(Date.now() - 7200000), // 2 hr ago
    dueAt: new Date(Date.now() - 3600000), // 1 hr ago (OVERDUE)
    cancelledAt: null,
    cancelReason: null,
    revision: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const denyPlan: FormPlan = {
    id: 'p1',
    organizationId: 'c1',
    formTemplateId: 't1',
    name: 'Strict Plan',
    scheduleKind: 'MANUAL',
    scheduleConfig: {},
    timezone: 'Asia/Bangkok',
    fixedVersionId: null,
    reviewMode: 'OVERALL',
    latePolicy: 'DENY',
    missedPolicy: 'AUTO_CANCEL',
    effectiveFrom: new Date(),
    effectiveUntil: null,
    revision: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const member: OrganizationMember = {
    id: 'm1',
    organizationId: 'c1',
    siteId: 'b1',
    userId: 'u1',
    roleId: 'r1',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const denyAssignmentRepo: Partial<IFormAssignmentRepository> = {
    findByMemberId: async () => [assignment],
    findByRoleId: async () => [],
  };
  const denyMemberRepo: Partial<IOrganizationMemberRepository> = {
    findById: async () => member,
  };
  const denyOccRepo: Partial<IFormOccurrenceRepository> = {
    findById: async () => overdueOccurrence,
  };
  const emptyTemplateRepo: Partial<IFormTemplateRepository> = {
    findById: async () => null,
  };
  const denyPlanRepo: Partial<IFormPlanRepository> = {
    findById: async () => denyPlan,
  };
  const emptySubRepo: Partial<IFormSubmissionRepository> = {
    findByAssignmentIds: async () => [],
  };
  const emptyReviewRepo: Partial<IFormReviewEntryRepository> = {
    findHeadFinalBySubmissionIds: async () => [],
  };

  const usecase = new ListMyAssignmentsUseCase(
    denyAssignmentRepo as IFormAssignmentRepository,
    denyMemberRepo as IOrganizationMemberRepository,
    denyOccRepo as IFormOccurrenceRepository,
    emptyTemplateRepo as IFormTemplateRepository,
    undefined,
    denyPlanRepo as IFormPlanRepository,
    emptySubRepo as IFormSubmissionRepository,
    emptyReviewRepo as IFormReviewEntryRepository,
  );

  const deniedResults = await usecase.execute(ctx);
  assert.equal(deniedResults[0].isOverdue, true);
  assert.equal(deniedResults[0].availableActions?.canStart, false);
  assert.equal(
    deniedResults[0].availableActions?.disabledReason,
    'หมดเวลากรอกตามนโยบายของแผนการตรวจ',
  );

  // Now test with latePolicy = ALLOW
  const allowPlan: FormPlan = { ...denyPlan, latePolicy: 'ALLOW' };
  const allowPlanRepo: Partial<IFormPlanRepository> = {
    findById: async () => allowPlan,
  };

  const allowUsecase = new ListMyAssignmentsUseCase(
    denyAssignmentRepo as IFormAssignmentRepository,
    denyMemberRepo as IOrganizationMemberRepository,
    denyOccRepo as IFormOccurrenceRepository,
    emptyTemplateRepo as IFormTemplateRepository,
    undefined,
    allowPlanRepo as IFormPlanRepository,
    emptySubRepo as IFormSubmissionRepository,
    emptyReviewRepo as IFormReviewEntryRepository,
  );

  const allowedResults = await allowUsecase.execute(ctx);
  assert.equal(allowedResults[0].isOverdue, true);
  assert.equal(allowedResults[0].availableActions?.canStart, true);
  assert.equal(allowedResults[0].availableActions?.disabledReason, null);
});

test('ListFormSubmissionsUseCase calculates submissionSequence and isLatest', async () => {
  const originalSub: FormSubmission = {
    id: 's1',
    organizationId: 'c1',
    assignmentId: 'a1',
    formVersionId: 'fv1',
    startedBy: 'm1',
    submittedBy: 'm1',
    revision: 1,
    status: 'RETURNED',
    submittedAt: new Date(Date.now() - 3600000),
    supersedesSubmissionId: null,
    createdAt: new Date(Date.now() - 7200000),
    updatedAt: new Date(Date.now() - 3600000),
  };

  const correctionSub: FormSubmission = {
    id: 's2',
    organizationId: 'c1',
    assignmentId: 'a1',
    formVersionId: 'fv1',
    startedBy: 'm1',
    submittedBy: 'm1',
    revision: 1,
    status: 'APPROVED',
    submittedAt: new Date(),
    supersedesSubmissionId: 's1',
    createdAt: new Date(Date.now() - 1800000),
    updatedAt: new Date(),
  };

  const returnReview: FormReviewEntry = {
    id: 'rev1',
    organizationId: 'c1',
    submissionId: 's1',
    formVersionId: 'v1',
    reviewedBy: 'm2',
    answerId: null,
    sectionId: null,
    action: 'RETURN',
    note: 'Please fix section 2',
    supersedesEntryId: null,
    createdAt: new Date(),
  };

  const approveReview: FormReviewEntry = {
    id: 'rev2',
    organizationId: 'c1',
    submissionId: 's2',
    formVersionId: 'v1',
    reviewedBy: 'm2',
    answerId: null,
    sectionId: null,
    action: 'APPROVE',
    note: 'All clear',
    supersedesEntryId: null,
    createdAt: new Date(),
  };

  const user1: User = {
    id: 'u1',
    name: 'Somchai Submitter',
    email: 'somchai@example.com',
    image: null,
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const user2: User = {
    id: 'u2',
    name: 'Somsak Reviewer',
    email: 'somsak@example.com',
    image: null,
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const member1: OrganizationMember = {
    id: 'm1',
    organizationId: 'c1',
    siteId: 'b1',
    userId: 'u1',
    roleId: 'r1',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const member2: OrganizationMember = {
    id: 'm2',
    organizationId: 'c1',
    siteId: 'b1',
    userId: 'u2',
    roleId: 'r2',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const subRepo: Partial<IFormSubmissionRepository> = {
    findByOrganizationId: async () => [originalSub, correctionSub],
    findByAssignmentId: async () => [originalSub, correctionSub],
  };

  const assignRepo: Partial<IFormAssignmentRepository> = {
    findById: async () =>
      ({
        id: 'a1',
        occurrenceId: 'occ1',
        organizationMemberId: 'm1',
        roleId: null,
      }) as unknown as FormAssignment,
  };

  const memRepo: Partial<IOrganizationMemberRepository> = {
    findById: async (id: string) =>
      id === 'm1' ? member1 : id === 'm2' ? member2 : null,
  };

  const occRepo: Partial<IFormOccurrenceRepository> = {
    findById: async () =>
      ({
        id: 'occ1',
        planId: 'p1',
        formTemplateId: 't1',
      }) as unknown as FormOccurrence,
  };

  const pRepo: Partial<IFormPlanRepository> = {
    findById: async () =>
      ({ id: 'p1', name: 'Monthly Audit' }) as unknown as FormPlan,
  };

  const tRepo: Partial<IFormTemplateRepository> = {
    findById: async () =>
      ({ id: 't1', name: 'Audit Checklist' }) as unknown as FormTemplate,
  };

  const revEntryRepo: Partial<IFormReviewEntryRepository> = {
    findHeadFinalBySubmissionIds: async () => [returnReview, approveReview],
  };

  const uRepo: Partial<IUserRepository> = {
    findById: async (id: string) =>
      id === 'u1' ? user1 : id === 'u2' ? user2 : null,
  };

  const usecase = new ListFormSubmissionsUseCase(
    subRepo as IFormSubmissionRepository,
    assignRepo as IFormAssignmentRepository,
    memRepo as IOrganizationMemberRepository,
    occRepo as IFormOccurrenceRepository,
    pRepo as IFormPlanRepository,
    tRepo as IFormTemplateRepository,
    revEntryRepo as IFormReviewEntryRepository,
    undefined,
    uRepo as IUserRepository,
  );

  const list = await usecase.execute(ctx);
  assert.equal(list.length, 2);

  const item1 = list.find((s) => s.id === 's1');
  const item2 = list.find((s) => s.id === 's2');

  assert.equal(item1?.submissionSequence, 1);
  assert.equal(item1?.isLatest, false);
  assert.equal(item1?.submittedByName, 'Somchai Submitter');
  assert.equal(item1?.finalReviewAction, 'RETURN');
  assert.equal(item1?.finalReviewNote, 'Please fix section 2');
  assert.equal(item1?.reviewerName, 'Somsak Reviewer');

  assert.equal(item2?.submissionSequence, 2);
  assert.equal(item2?.isLatest, true);
  assert.equal(item2?.finalReviewAction, 'APPROVE');
  assert.equal(item2?.reviewerName, 'Somsak Reviewer');
});
