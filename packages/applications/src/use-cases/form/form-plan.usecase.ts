import type { IUnitOfWork } from '@repo/domains';
import { RequirePermission } from '../../decorators/permission.decorator';
import type { FormPlan } from '@repo/domains/entities/form';
import type {
  IActivateFormPlanContext,
  IActivateFormPlanUseCase,
  ICreateFormPlanContext,
  ICreateFormPlanUseCase,
  IUpdateFormPlanContext,
  IUpdateFormPlanUseCase,
  IGetFormPlanContext,
  IGetFormPlanUseCase,
  IListFormPlansContext,
  IListFormPlansUseCase,
  IPauseFormPlanContext,
  IPauseFormPlanUseCase,
  FormPlanDetail,
} from '@repo/domains/applications/form';
import type {
  IFormPlanPeriodRepository,
  IFormPlanRepository,
  IFormPlanTargetRepository,
  IFormTemplateRepository,
  IFormVersionRepository,
} from '@repo/domains/repositories/form';
import type { ICompanyMemberRepository } from '@repo/domains/repositories/company';
import {
  createFormPlanSchema,
  formScheduleConfigSchema,
} from '@repo/domains/schema/form';
import { requireRevisionMatch } from '../../lib/concurrency';
import {
  BadRequestError,
  NotFoundError,
  ValidationError,
} from '../../lib/error';

export class CreateFormPlanUseCase implements ICreateFormPlanUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly planRepo: IFormPlanRepository,
    private readonly targetRepo: IFormPlanTargetRepository,
    private readonly periodRepo: IFormPlanPeriodRepository,
    private readonly templateRepo: IFormTemplateRepository,
    private readonly versionRepo: IFormVersionRepository,
    private readonly memberRepo?: ICompanyMemberRepository,
  ) {}

  @RequirePermission('form_plan:manage')
  async execute(context: ICreateFormPlanContext): Promise<FormPlan> {
    const companyId = context.companyId ?? context.activeCompanyId;
    if (!companyId) throw new BadRequestError('companyId is required');
    return this.unitOfWork.transaction(async () => {
      let member =
        context.memberId && this.memberRepo
          ? await this.memberRepo.findById(context.memberId)
          : null;
      if (
        (!member || !member.isActive || member.companyId !== companyId) &&
        context.user?.id &&
        this.memberRepo
      ) {
        member = await this.memberRepo.findByCompanyAndUser(
          companyId,
          context.user.id,
        );
      }
      if (
        !member ||
        !member.isActive ||
        member.companyId !== companyId ||
        (context.user?.id && member.userId !== context.user.id)
      ) {
        throw new BadRequestError('Active company membership is required');
      }
      const createdBy = member.id;

      const parsed = await createFormPlanSchema.safeParseAsync({
        ...context.data,
        companyId,
        createdBy,
      });
      if (!parsed.success) {
        throw new ValidationError('Invalid form plan data', parsed.error);
      }

      const template = await this.templateRepo.findByIdAndCompany(
        parsed.data.formTemplateId!,
        companyId,
      );
      if (!template) {
        throw new NotFoundError(
          'Form template not found or does not belong to company',
        );
      }

      const validTimezone = await Promise.resolve()
        .then(
          () =>
            new Intl.DateTimeFormat('en', { timeZone: parsed.data.timezone }),
        )
        .then(
          () => true,
          () => false,
        );
      if (!validTimezone) throw new ValidationError('Invalid IANA timezone');
      if (parsed.data.scheduleKind === 'RECURRING') {
        const schedule = await formScheduleConfigSchema.safeParseAsync(
          parsed.data.scheduleConfig,
        );
        if (!schedule.success)
          throw new ValidationError(
            'Invalid recurring schedule',
            schedule.error,
          );
        if (!parsed.data.scheduleConfig) {
          throw new BadRequestError(
            'scheduleConfig is required for RECURRING plans',
          );
        }
      } else if (parsed.data.scheduleKind === 'EXPLICIT') {
        if (!context.periods || context.periods.length === 0) {
          throw new BadRequestError('periods are required for EXPLICIT plans');
        }
        for (const p of context.periods) {
          if (new Date(p.dueAt) <= new Date(p.opensAt)) {
            throw new BadRequestError(
              'dueAt must be strictly greater than opensAt',
            );
          }
        }
      }

      if (parsed.data.fixedVersionId) {
        const fixedVersion = await this.versionRepo.findById(
          parsed.data.fixedVersionId,
        );
        if (!fixedVersion || fixedVersion.formTemplateId !== template.id) {
          throw new BadRequestError(
            'fixedVersionId must belong to the same form template',
          );
        }
      }

      const plan = await this.planRepo.create(parsed.data);

      for (const t of context.targets) {
        await this.targetRepo.create({
          roleId: t.roleId ?? null,
          companyMemberId: t.companyMemberId ?? null,
          roleDistribution: t.roleDistribution ?? null,
          planId: plan.id,
          companyId,
        });
      }

      if (parsed.data.scheduleKind === 'EXPLICIT' && context.periods) {
        for (const p of context.periods) {
          await this.periodRepo.create({
            opensAt: new Date(p.opensAt),
            dueAt: new Date(p.dueAt),
            planId: plan.id,
            companyId,
          });
        }
      }

      return plan;
    });
  }
}

export class UpdateFormPlanUseCase implements IUpdateFormPlanUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly planRepo: IFormPlanRepository,
    private readonly targetRepo: IFormPlanTargetRepository,
    private readonly periodRepo: IFormPlanPeriodRepository,
    private readonly templateRepo: IFormTemplateRepository,
    private readonly versionRepo: IFormVersionRepository,
    private readonly memberRepo?: ICompanyMemberRepository,
  ) {}

  @RequirePermission('form_plan:manage')
  async execute(context: IUpdateFormPlanContext): Promise<FormPlan> {
    const companyId = context.companyId ?? context.activeCompanyId;
    if (!companyId) throw new BadRequestError('companyId is required');

    return this.unitOfWork.transaction(async () => {
      const plan = await this.planRepo.findById(context.id);
      if (!plan || plan.companyId !== companyId) {
        throw new NotFoundError('Form plan not found');
      }

      requireRevisionMatch(
        plan.revision,
        context.expectedRevision,
        () => new BadRequestError('Optimistic concurrency check failed'),
      );

      let member =
        context.memberId && this.memberRepo
          ? await this.memberRepo.findById(context.memberId)
          : null;
      if (
        (!member || !member.isActive || member.companyId !== companyId) &&
        context.user?.id &&
        this.memberRepo
      ) {
        member = await this.memberRepo.findByCompanyAndUser(
          companyId,
          context.user.id,
        );
      }
      if (
        !member ||
        !member.isActive ||
        member.companyId !== companyId ||
        (context.user?.id && member.userId !== context.user.id)
      ) {
        throw new BadRequestError('Active company membership is required');
      }

      const mergedData = {
        name: context.data.name ?? plan.name,
        timezone: context.data.timezone ?? plan.timezone,
        scheduleKind: context.data.scheduleKind ?? plan.scheduleKind,
        scheduleConfig:
          context.data.scheduleConfig !== undefined
            ? context.data.scheduleConfig
            : plan.scheduleConfig,
        fixedVersionId:
          context.data.fixedVersionId !== undefined
            ? context.data.fixedVersionId
            : plan.fixedVersionId,
        reviewMode: context.data.reviewMode ?? plan.reviewMode,
        latePolicy: context.data.latePolicy ?? plan.latePolicy,
        missedPolicy: context.data.missedPolicy ?? plan.missedPolicy,
      };

      const validTimezone = await Promise.resolve()
        .then(
          () =>
            new Intl.DateTimeFormat('en', { timeZone: mergedData.timezone }),
        )
        .then(
          () => true,
          () => false,
        );
      if (!validTimezone) throw new ValidationError('Invalid IANA timezone');

      if (mergedData.scheduleKind === 'RECURRING') {
        if (!mergedData.scheduleConfig) {
          throw new BadRequestError(
            'scheduleConfig is required for RECURRING plans',
          );
        }
        const schedule = await formScheduleConfigSchema.safeParseAsync(
          mergedData.scheduleConfig,
        );
        if (!schedule.success) {
          throw new ValidationError(
            'Invalid recurring schedule',
            schedule.error,
          );
        }
      } else if (mergedData.scheduleKind === 'EXPLICIT') {
        mergedData.scheduleConfig = null;
        if (context.periods) {
          for (const p of context.periods) {
            if (new Date(p.dueAt) <= new Date(p.opensAt)) {
              throw new BadRequestError(
                'dueAt must be strictly greater than opensAt',
              );
            }
          }
        }
      }

      if (mergedData.fixedVersionId) {
        const fixedVersion = await this.versionRepo.findById(
          mergedData.fixedVersionId,
        );
        if (
          !fixedVersion ||
          fixedVersion.formTemplateId !== plan.formTemplateId
        ) {
          throw new BadRequestError(
            'fixedVersionId must belong to the same form template',
          );
        }
      }

      const isDraft = plan.effectiveFrom === null;

      if (isDraft) {
        const updated = await this.planRepo.update(plan.id, {
          name: mergedData.name,
          timezone: mergedData.timezone,
          scheduleKind: mergedData.scheduleKind,
          scheduleConfig: mergedData.scheduleConfig,
          fixedVersionId: mergedData.fixedVersionId,
          reviewMode: mergedData.reviewMode,
          latePolicy: mergedData.latePolicy,
          missedPolicy: mergedData.missedPolicy,
          revision: plan.revision + 1,
        });

        if (context.targets !== undefined) {
          await this.targetRepo.deleteByPlanId(plan.id);
          for (const t of context.targets) {
            await this.targetRepo.create({
              roleId: t.roleId ?? null,
              companyMemberId: t.companyMemberId ?? null,
              roleDistribution: t.roleDistribution ?? null,
              planId: plan.id,
              companyId,
            });
          }
        }

        if (
          context.periods !== undefined &&
          mergedData.scheduleKind === 'EXPLICIT'
        ) {
          await this.periodRepo.deleteByPlanId(plan.id);
          for (const p of context.periods) {
            await this.periodRepo.create({
              opensAt: new Date(p.opensAt),
              dueAt: new Date(p.dueAt),
              planId: plan.id,
              companyId,
            });
          }
        }

        return updated;
      } else {
        const now = new Date();
        const wasActive = plan.effectiveUntil === null;
        if (wasActive) {
          await this.planRepo.update(plan.id, {
            effectiveUntil: now,
            closedBy: member.id,
            revision: plan.revision + 1,
          });
        }

        const successorPlan = await this.planRepo.create({
          companyId,
          formTemplateId: plan.formTemplateId,
          supersedesPlanId: plan.id,
          name: mergedData.name,
          timezone: mergedData.timezone,
          scheduleKind: mergedData.scheduleKind,
          scheduleConfig: mergedData.scheduleConfig,
          fixedVersionId: mergedData.fixedVersionId,
          reviewMode: mergedData.reviewMode,
          latePolicy: mergedData.latePolicy,
          missedPolicy: mergedData.missedPolicy,
          effectiveFrom: wasActive ? now : null,
          effectiveUntil: null,
          createdBy: member.id,
          closedBy: null,
          revision: plan.revision + 1,
        });

        if (context.targets !== undefined) {
          for (const t of context.targets) {
            await this.targetRepo.create({
              roleId: t.roleId ?? null,
              companyMemberId: t.companyMemberId ?? null,
              roleDistribution: t.roleDistribution ?? null,
              planId: successorPlan.id,
              companyId,
            });
          }
        } else {
          const oldTargets = await this.targetRepo.findByPlanId(plan.id);
          for (const t of oldTargets) {
            await this.targetRepo.create({
              roleId: t.roleId ?? null,
              companyMemberId: t.companyMemberId ?? null,
              roleDistribution: t.roleDistribution ?? null,
              planId: successorPlan.id,
              companyId,
            });
          }
        }

        if (mergedData.scheduleKind === 'EXPLICIT') {
          if (context.periods !== undefined) {
            for (const p of context.periods) {
              await this.periodRepo.create({
                opensAt: new Date(p.opensAt),
                dueAt: new Date(p.dueAt),
                planId: successorPlan.id,
                companyId,
              });
            }
          } else {
            const oldPeriods = await this.periodRepo.findByPlanId(plan.id);
            for (const p of oldPeriods) {
              await this.periodRepo.create({
                opensAt: new Date(p.opensAt),
                dueAt: new Date(p.dueAt),
                planId: successorPlan.id,
                companyId,
              });
            }
          }
        }

        return successorPlan;
      }
    });
  }
}

export class GetFormPlanUseCase implements IGetFormPlanUseCase {
  constructor(
    private readonly planRepo: IFormPlanRepository,
    private readonly targetRepo?: IFormPlanTargetRepository,
    private readonly periodRepo?: IFormPlanPeriodRepository,
  ) {}

  @RequirePermission('form_plan:read')
  async execute(context: IGetFormPlanContext): Promise<FormPlanDetail> {
    const plan = await this.planRepo.findById(context.id);
    const companyId = context.companyId ?? context.activeCompanyId;
    if (!plan || (companyId && plan.companyId !== companyId)) {
      throw new NotFoundError('Form plan not found');
    }
    const targets = this.targetRepo
      ? await this.targetRepo.findByPlanId(plan.id)
      : [];
    const periods = this.periodRepo
      ? await this.periodRepo.findByPlanId(plan.id)
      : [];
    return {
      plan,
      targets,
      periods,
    };
  }
}

export class ListFormPlansUseCase implements IListFormPlansUseCase {
  constructor(private readonly planRepo: IFormPlanRepository) {}

  @RequirePermission('form_plan:read')
  async execute(context: IListFormPlansContext): Promise<FormPlan[]> {
    return this.planRepo.listPlans(context.companyId, 1, 50);
  }
}

export class ActivateFormPlanUseCase implements IActivateFormPlanUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly planRepo: IFormPlanRepository,
    private readonly templateRepo: IFormTemplateRepository,
    private readonly versionRepo: IFormVersionRepository,
    private readonly targetRepo: IFormPlanTargetRepository,
    private readonly periodRepo: IFormPlanPeriodRepository,
  ) {}

  @RequirePermission('form_plan:manage')
  async execute(context: IActivateFormPlanContext): Promise<FormPlan> {
    return this.unitOfWork.transaction(async () => {
      const plan = await this.planRepo.findById(context.id);
      const companyId = context.companyId ?? context.activeCompanyId;
      if (!plan || (companyId && plan.companyId !== companyId)) {
        throw new NotFoundError('Form plan not found');
      }

      requireRevisionMatch(
        plan.revision,
        context.expectedRevision,
        () => new BadRequestError('Optimistic concurrency check failed'),
      );

      if (plan.effectiveFrom !== null && plan.effectiveUntil === null) {
        throw new BadRequestError('Plan is already active');
      }

      const publishedVersion = await this.versionRepo.findPublishedByTemplateId(
        plan.formTemplateId,
      );
      if (!publishedVersion) {
        throw new BadRequestError(
          'Template must have a published version to activate plan',
        );
      }

      const targets = await this.targetRepo.findByPlanId(plan.id);
      if (targets.length === 0) {
        throw new BadRequestError('Plan must have at least one target');
      }

      if (plan.scheduleKind === 'EXPLICIT') {
        const periods = await this.periodRepo.findByPlanId(plan.id);
        if (periods.length === 0) {
          throw new BadRequestError(
            'EXPLICIT plan must have at least one period',
          );
        }
      }

      return this.planRepo.update(plan.id, {
        effectiveFrom: new Date(),
        effectiveUntil: null,
        closedBy: null,
        revision: plan.revision + 1,
      });
    });
  }
}

export class PauseFormPlanUseCase implements IPauseFormPlanUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly planRepo: IFormPlanRepository,
    private readonly memberRepo?: ICompanyMemberRepository,
  ) {}

  @RequirePermission('form_plan:manage')
  async execute(context: IPauseFormPlanContext): Promise<FormPlan> {
    return this.unitOfWork.transaction(async () => {
      const plan = await this.planRepo.findById(context.id);
      const companyId = context.companyId ?? context.activeCompanyId;
      if (!plan || (companyId && plan.companyId !== companyId)) {
        throw new NotFoundError('Form plan not found');
      }

      requireRevisionMatch(
        plan.revision,
        context.expectedRevision,
        () => new BadRequestError('Optimistic concurrency check failed'),
      );

      if (plan.effectiveFrom === null || plan.effectiveUntil !== null) {
        throw new BadRequestError('Plan is not currently active');
      }

      let closedBy: string | null = null;
      if (this.memberRepo) {
        let member = context.memberId
          ? await this.memberRepo.findById(context.memberId)
          : null;
        if (
          (!member ||
            !member.isActive ||
            member.companyId !== plan.companyId) &&
          context.user?.id
        ) {
          member = await this.memberRepo.findByCompanyAndUser(
            plan.companyId,
            context.user.id,
          );
        }
        if (member && member.isActive && member.companyId === plan.companyId) {
          closedBy = member.id;
        }
      } else {
        closedBy = context.memberId ?? null;
      }

      return this.planRepo.update(plan.id, {
        effectiveUntil: new Date(),
        closedBy,
        revision: plan.revision + 1,
      });
    });
  }
}
