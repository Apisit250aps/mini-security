import type { IUnitOfWork } from '@repo/domains';
import { RequirePermission } from '../../decorators/permission.decorator';
import type { FormPlan } from '@repo/domains/entities/form';
import type {
  IActivateFormPlanContext,
  IActivateFormPlanUseCase,
  ICreateFormPlanContext,
  ICreateFormPlanUseCase,
  IGetFormPlanContext,
  IGetFormPlanUseCase,
  IListFormPlansContext,
  IListFormPlansUseCase,
  IPauseFormPlanContext,
  IPauseFormPlanUseCase,
} from '@repo/domains/applications/form';
import type {
  IFormPlanPeriodRepository,
  IFormPlanRepository,
  IFormPlanTargetRepository,
  IFormTemplateRepository,
  IFormVersionRepository,
} from '@repo/domains/repositories/form';
import { createFormPlanSchema } from '@repo/domains/schema/form';
import { BadRequestError, NotFoundError, ValidationError } from '../../lib/error';

export class CreateFormPlanUseCase implements ICreateFormPlanUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly planRepo: IFormPlanRepository,
    private readonly targetRepo: IFormPlanTargetRepository,
    private readonly periodRepo: IFormPlanPeriodRepository,
    private readonly templateRepo: IFormTemplateRepository,
    private readonly versionRepo: IFormVersionRepository,
  ) {}

  @RequirePermission('form_plan:manage')
  async execute(context: ICreateFormPlanContext): Promise<FormPlan> {
    const companyId = context.companyId ?? context.activeCompanyId;
    if (!companyId) throw new BadRequestError('companyId is required');
    return this.unitOfWork.transaction(async () => {
      const parsed = await createFormPlanSchema.safeParseAsync(context.data);
      if (!parsed.success) {
        throw new ValidationError('Invalid form plan data', parsed.error);
      }

      const template = await this.templateRepo.findByIdAndCompany(parsed.data.formTemplateId!, companyId);
      if (!template) {
        throw new NotFoundError('Form template not found or does not belong to company');
      }

      if (parsed.data.scheduleKind === 'RECURRING') {
        if (!parsed.data.scheduleConfig) {
          throw new BadRequestError('scheduleConfig is required for RECURRING plans');
        }
      } else if (parsed.data.scheduleKind === 'EXPLICIT') {
        if (!context.periods || context.periods.length === 0) {
          throw new BadRequestError('periods are required for EXPLICIT plans');
        }
        for (const p of context.periods) {
          if (new Date(p.dueAt) <= new Date(p.opensAt)) {
            throw new BadRequestError('dueAt must be strictly greater than opensAt');
          }
        }
      }

      if (parsed.data.fixedVersionId) {
        const fixedVersion = await this.versionRepo.findById(parsed.data.fixedVersionId);
        if (!fixedVersion || fixedVersion.formTemplateId !== template.id) {
          throw new BadRequestError('fixedVersionId must belong to the same form template');
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

export class GetFormPlanUseCase implements IGetFormPlanUseCase {
  constructor(private readonly planRepo: IFormPlanRepository) {}

  @RequirePermission('form_plan:read')
  async execute(context: IGetFormPlanContext): Promise<FormPlan> {
    const plan = await this.planRepo.findById(context.id);
    const companyId = context.companyId ?? context.activeCompanyId;
    if (!plan || (companyId && plan.companyId !== companyId)) {
      throw new NotFoundError('Form plan not found');
    }
    return plan;
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

      if (plan.revision !== context.expectedRevision) {
        throw new BadRequestError('Optimistic concurrency check failed');
      }

      if (plan.effectiveFrom !== null && plan.effectiveUntil === null) {
        throw new BadRequestError('Plan is already active');
      }

      const publishedVersion = await this.versionRepo.findPublishedByTemplateId(plan.formTemplateId);
      if (!publishedVersion) {
        throw new BadRequestError('Template must have a published version to activate plan');
      }

      const targets = await this.targetRepo.findByPlanId(plan.id);
      if (targets.length === 0) {
        throw new BadRequestError('Plan must have at least one target');
      }

      if (plan.scheduleKind === 'EXPLICIT') {
        const periods = await this.periodRepo.findByPlanId(plan.id);
        if (periods.length === 0) {
          throw new BadRequestError('EXPLICIT plan must have at least one period');
        }
      }

      return this.planRepo.update(plan.id, {
        effectiveFrom: new Date(),
        revision: plan.revision + 1,
      });
    });
  }
}

export class PauseFormPlanUseCase implements IPauseFormPlanUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly planRepo: IFormPlanRepository,
  ) {}

  @RequirePermission('form_plan:manage')
  async execute(context: IPauseFormPlanContext): Promise<FormPlan> {
    return this.unitOfWork.transaction(async () => {
      const plan = await this.planRepo.findById(context.id);
      const companyId = context.companyId ?? context.activeCompanyId;
      if (!plan || (companyId && plan.companyId !== companyId)) {
        throw new NotFoundError('Form plan not found');
      }

      if (plan.revision !== context.expectedRevision) {
        throw new BadRequestError('Optimistic concurrency check failed');
      }

      if (plan.effectiveFrom === null || plan.effectiveUntil !== null) {
        throw new BadRequestError('Plan is not currently active');
      }

      return this.planRepo.update(plan.id, {
        effectiveUntil: new Date(),
        closedBy: context.memberId ?? null,
        revision: plan.revision + 1,
      });
    });
  }
}
