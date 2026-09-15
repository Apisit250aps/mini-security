import type { IUnitOfWork } from '@repo/domains';
import { RequirePermission } from '../../decorators/permission.decorator';
import type { FormOccurrence } from '@repo/domains/entities/form';
import type {
  ICancelOccurrenceContext,
  ICancelOccurrenceUseCase,
  IOpenDueOccurrencesContext,
  IOpenDueOccurrencesUseCase,
} from '@repo/domains/applications/form';
import type {
  IFormAssignmentRepository,
  IFormOccurrenceRepository,
  IFormPlanRepository,
  IFormPlanTargetRepository,
} from '@repo/domains/repositories/form';
import { BadRequestError, NotFoundError } from '../../lib/error';
import { calculateDueDate, calculateNextOccurrences, generateOccurrenceKey, ScheduleConfig } from './form-schedule.usecase';

export class OpenDueOccurrencesUseCase implements IOpenDueOccurrencesUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly planRepo: IFormPlanRepository,
    private readonly occurrenceRepo: IFormOccurrenceRepository,
    private readonly assignmentRepo: IFormAssignmentRepository,
    private readonly targetRepo: IFormPlanTargetRepository,
  ) {}

  @RequirePermission('form_occurrence:open')
  async execute(context: IOpenDueOccurrencesContext): Promise<FormOccurrence[]> {
    const activePlans = await this.planRepo.listPlans(context.companyId, 1, 1000);
    const recurringPlans = activePlans.filter(p => 
      p.scheduleKind === 'RECURRING' && 
      p.effectiveFrom !== null && 
      (p.effectiveUntil === null || p.effectiveUntil! > new Date())
    );

    const createdOccurrences: FormOccurrence[] = [];
    const now = new Date();

    for (const plan of recurringPlans) {
      if (!plan.scheduleConfig) continue;

      const config = plan.scheduleConfig as ScheduleConfig;
      // Note: A real implementation would calculate from the last occurrence or effectiveFrom.
      // We use effectiveFrom as the base for simplicity.
      const baseDate = plan.effectiveFrom || now;
      const nextDates = calculateNextOccurrences(config, plan.timezone!, baseDate, 7);

      for (const opensAt of nextDates) {
        if (opensAt > now) continue;

        const localDate = opensAt.toISOString().split('T')[0] || ''; // Simplify
        const occurrenceKey = generateOccurrenceKey(plan.id, localDate, plan.timezone!);

        const existing = await this.occurrenceRepo.findByOccurrenceKey(plan.id, occurrenceKey);
        if (existing) continue;

        const dueAt = calculateDueDate(opensAt, config.dueOffset, plan.timezone!);

        await this.unitOfWork.transaction(async () => {
          const targets = await this.targetRepo.findByPlanId(plan.id);
          
          const occurrence = await this.occurrenceRepo.create({
            companyId: context.companyId,
            planId: plan.id,
            formTemplateId: plan.formTemplateId!,
            formVersionId: plan.fixedVersionId || 'LATEST_VERSION_ID', // Simplification
            occurrenceKey,
            opensAt,
            dueAt,
            revision: 1,
          });

          // Assignment logic
          for (const target of targets) {
            if (target.roleId && target.roleDistribution === 'SHARED') {
              await this.assignmentRepo.create({
                companyId: context.companyId,
                occurrenceId: occurrence.id,
                formVersionId: occurrence.formVersionId,
                roleId: target.roleId,
                revision: 1,
              });
            } else if (target.companyMemberId) {
              await this.assignmentRepo.create({
                companyId: context.companyId,
                occurrenceId: occurrence.id,
                formVersionId: occurrence.formVersionId,
                companyMemberId: target.companyMemberId,
                revision: 1,
              });
            }
            // Add PER_MEMBER logic when role members are available
          }

          createdOccurrences.push(occurrence);
        });
      }
    }

    return createdOccurrences;
  }
}

export class CancelOccurrenceUseCase implements ICancelOccurrenceUseCase {
  constructor(private readonly occurrenceRepo: IFormOccurrenceRepository) {}

  @RequirePermission('form_plan:manage')
  async execute(context: ICancelOccurrenceContext): Promise<FormOccurrence> {
    const occurrence = await this.occurrenceRepo.findById(context.occurrenceId);
    const companyId = context.companyId ?? context.activeCompanyId;
    if (!occurrence || (companyId && occurrence.companyId !== companyId)) {
      throw new NotFoundError('Occurrence not found');
    }

    if (context.expectedRevision != null && occurrence.revision !== context.expectedRevision) {
      throw new BadRequestError('Optimistic concurrency check failed');
    }

    if (occurrence.cancelledAt !== null) {
      throw new BadRequestError('Occurrence is already cancelled');
    }

    return this.occurrenceRepo.cancel(occurrence.id, {
      cancelledAt: new Date(),
      cancelledBy: context.memberId ?? null,
      cancelReason: context.cancelReason,
      revision: occurrence.revision + 1,
    });
  }
}
