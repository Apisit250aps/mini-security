import type { IUnitOfWork } from '@repo/domains';
import { RequirePermission } from '../../decorators/permission.decorator';
import type { FormOccurrence } from '@repo/domains/entities/form';
import type {
  ICancelOccurrenceContext,
  ICancelOccurrenceUseCase,
  IOpenDueOccurrencesContext,
  IOpenDueOccurrencesUseCase,
  IListOccurrencesContext,
  IListOccurrencesUseCase,
} from '@repo/domains/applications/form';
import type {
  IFormAssignmentRepository,
  IFormOccurrenceRepository,
  IFormPlanPeriodRepository,
  IFormPlanRepository,
  IFormPlanTargetRepository,
  IFormVersionRepository,
} from '@repo/domains/repositories/form';
import type { ICompanyMemberRepository } from '@repo/domains/repositories/company';
import { BadRequestError, NotFoundError } from '../../lib/error';
import {
  calculateDueDate,
  calculateNextOccurrences,
  generateOccurrenceKey,
  ScheduleConfig,
} from './form-schedule.usecase';

export class OpenDueOccurrencesUseCase implements IOpenDueOccurrencesUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly planRepo: IFormPlanRepository,
    private readonly occurrenceRepo: IFormOccurrenceRepository,
    private readonly assignmentRepo: IFormAssignmentRepository,
    private readonly targetRepo: IFormPlanTargetRepository,
    private readonly versionRepo: IFormVersionRepository,
    private readonly periodRepo: IFormPlanPeriodRepository,
    private readonly memberRepo: ICompanyMemberRepository,
  ) {}

  @RequirePermission('form_plan:manage')
  async execute(
    context: IOpenDueOccurrencesContext,
  ): Promise<FormOccurrence[]> {
    const createdOccurrences: FormOccurrence[] = [];
    const now = new Date();
    const plans = await this.planRepo.listPlans(context.companyId, 1, 1000);
    for (const candidate of plans) {
      const opened = await this.unitOfWork.transaction(async () => {
        // Read the plan inside the same serializable transaction as its occurrences.
        const plan = await this.planRepo.findById(candidate.id);
        if (!plan?.effectiveFrom || plan.effectiveFrom > now) return [];
        if (plan.effectiveUntil && plan.missedPolicy === 'SKIP') return [];
        const end =
          plan.effectiveUntil && plan.effectiveUntil < now
            ? plan.effectiveUntil
            : now;
        const version = plan.fixedVersionId
          ? await this.versionRepo!.findById(plan.fixedVersionId)
          : await this.versionRepo!.findPublishedByTemplateId(
              plan.formTemplateId,
            );
        if (!version || version.status === 'DRAFT')
          throw new BadRequestError('Plan requires a published form version');
        const existing = await this.occurrenceRepo.findByPlanId(plan.id);
        const keys = new Set(
          existing.map((occurrence) => occurrence.occurrenceKey),
        );
        let rounds: Array<{
          opensAt: Date;
          dueAt: Date;
          occurrenceKey: string;
          periodId?: string;
        }> = [];
        if (plan.scheduleKind === 'RECURRING' && plan.scheduleConfig) {
          const config = plan.scheduleConfig as ScheduleConfig;
          const latest = existing.reduce(
            (date, occurrence) =>
              occurrence.opensAt > date ? occurrence.opensAt : date,
            new Date(plan.effectiveFrom.getTime() - 1),
          );
          const from =
            plan.missedPolicy === 'SKIP' ? now : new Date(latest.getTime() + 1);
          let dates = calculateNextOccurrences(
            config,
            plan.timezone,
            from,
            plan.missedPolicy === 'SKIP' ? 10 : 100,
            plan.missedPolicy === 'SKIP',
          );
          dates = dates.filter(
            (date) =>
              date >= plan.effectiveFrom! &&
              date <= end &&
              (!plan.effectiveUntil || date < plan.effectiveUntil),
          );
          if (plan.missedPolicy === 'SKIP') dates = dates.slice(-1);
          rounds = dates.map((opensAt) => ({
            opensAt,
            dueAt: calculateDueDate(opensAt, config.dueOffset, plan.timezone),
            occurrenceKey: generateOccurrenceKey(
              plan.id,
              new Intl.DateTimeFormat('en-CA', {
                timeZone: plan.timezone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              }).format(opensAt),
              plan.timezone,
            ),
          }));
        } else if (plan.scheduleKind === 'EXPLICIT') {
          const periods = await this.periodRepo!.findByPlanId(plan.id);
          rounds = periods
            .filter(
              (period) =>
                period.opensAt >= plan.effectiveFrom! &&
                period.opensAt <= end &&
                (!plan.effectiveUntil || period.opensAt < plan.effectiveUntil),
            )
            .sort((a, b) => a.opensAt.getTime() - b.opensAt.getTime())
            .map((period) => ({
              ...period,
              periodId: period.id,
              occurrenceKey: `${plan.id}_period_${period.id}`,
            }));
          if (plan.missedPolicy === 'SKIP') rounds = rounds.slice(-1);
        }
        rounds = rounds
          .filter((round) => !keys.has(round.occurrenceKey))
          .slice(0, 100);
        if (!rounds.length) return [];
        const targets = await this.targetRepo.findByPlanId(plan.id);
        const members = (
          await this.memberRepo!.findByCompanyId(context.companyId)
        ).filter((member) => member.isActive);
        const memberIds = new Set<string>();
        const roleIds = new Set<string>();
        for (const target of targets) {
          if (target.roleId && target.roleDistribution === 'SHARED')
            roleIds.add(target.roleId);
          else if (target.roleId) {
            const recipients = members.filter(
              (member) => member.roleId === target.roleId,
            );
            if (!recipients.length)
              throw new BadRequestError(
                'PER_MEMBER target has no active recipients',
              );
            for (const member of recipients) memberIds.add(member.id);
          } else if (target.companyMemberId) {
            if (!members.some((member) => member.id === target.companyMemberId))
              throw new BadRequestError('Assigned member is inactive');
            memberIds.add(target.companyMemberId);
          }
        }
        if (!roleIds.size && !memberIds.size)
          throw new BadRequestError('Plan has no recipients');
        const result: FormOccurrence[] = [];
        for (const round of rounds) {
          const occurrence = await this.occurrenceRepo.create({
            companyId: context.companyId,
            planId: plan.id,
            formTemplateId: plan.formTemplateId,
            formVersionId: version.id,
            opensAt: round.opensAt,
            dueAt: round.dueAt,
            occurrenceKey: round.occurrenceKey,
            periodId: round.periodId ?? null,
            revision: 1,
          });
          for (const roleId of roleIds)
            await this.assignmentRepo.create({
              companyId: context.companyId,
              occurrenceId: occurrence.id,
              formVersionId: version.id,
              roleId,
              revision: 1,
            });
          for (const companyMemberId of memberIds)
            await this.assignmentRepo.create({
              companyId: context.companyId,
              occurrenceId: occurrence.id,
              formVersionId: version.id,
              companyMemberId,
              revision: 1,
            });
          result.push(occurrence);
        }
        return result;
      });
      createdOccurrences.push(...opened);
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

    if (
      context.expectedRevision != null &&
      occurrence.revision !== context.expectedRevision
    ) {
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

export class ListOccurrencesUseCase implements IListOccurrencesUseCase {
  constructor(private readonly occurrenceRepo: IFormOccurrenceRepository) {}

  @RequirePermission('form_plan:read')
  async execute(context: IListOccurrencesContext): Promise<FormOccurrence[]> {
    return this.occurrenceRepo.list(
      context.companyId,
      context.formTemplateId,
      context.planId,
    );
  }
}
