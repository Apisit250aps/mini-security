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
import type { IOrganizationMemberRepository } from '@repo/domains/repositories/organization';
import { BadRequestError, NotFoundError } from '../../lib/error';
import {
  calculateDueDate,
  generateOccurrenceKey,
  localToUtc,
  ScheduleConfig,
} from './form-schedule.usecase';
import { requireRevisionMatch } from '#lib/index';

export class OpenDueOccurrencesUseCase implements IOpenDueOccurrencesUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly planRepo: IFormPlanRepository,
    private readonly occurrenceRepo: IFormOccurrenceRepository,
    private readonly assignmentRepo: IFormAssignmentRepository,
    private readonly targetRepo: IFormPlanTargetRepository,
    private readonly versionRepo: IFormVersionRepository,
    private readonly periodRepo: IFormPlanPeriodRepository,
    private readonly memberRepo: IOrganizationMemberRepository,
  ) {}

  @RequirePermission('form_plan:manage')
  async execute(
    context: IOpenDueOccurrencesContext,
  ): Promise<FormOccurrence[]> {
    const createdOccurrences: FormOccurrence[] = [];
    const now = new Date();
    const plans = await this.planRepo.listPlans(
      context.organizationId,
      1,
      1000,
    );
    for (const candidate of plans) {
      const opened = await this.unitOfWork.transaction(async () => {
        // Read the plan inside the same serializable transaction as its occurrences.
        const plan = await this.planRepo.findById(candidate.id);
        if (!plan?.effectiveFrom) return [];
        if (plan.supersedesPlanId && plan.effectiveFrom > now) return [];
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
        const existingKeys = new Set(
          existing.map((occurrence) => occurrence.occurrenceKey),
        );
        const existingOpensAt = new Set(
          existing.map((occurrence) => occurrence.opensAt.getTime()),
        );
        const existingPeriodIds = new Set(
          existing
            .map((occurrence) => occurrence.periodId)
            .filter((id): id is string => Boolean(id)),
        );
        let rounds: Array<{
          opensAt: Date;
          dueAt: Date;
          occurrenceKey: string;
          periodId?: string;
        }> = [];
        if (plan.scheduleKind === 'RECURRING' && plan.scheduleConfig) {
          const config = plan.scheduleConfig as ScheduleConfig;
          const anchorParts = (config.anchorLocalDate || '2026-01-01').split(
            '-',
          );
          const anchorYear = Number(anchorParts[0]) || 2026;
          const anchorMonth = Number(anchorParts[1]) || 1;
          const anchorDay = Number(anchorParts[2]) || 1;
          const timeStr = config.openLocalTime || '00:00';
          const anchorDateUtc = localToUtc(
            config.anchorLocalDate,
            timeStr,
            plan.timezone,
          );

          // จุดที่ 1 และ 4: แผนแรกเริ่มจาก anchorDateUtc (ไม่ใช้วันสร้างหรือ effectiveFrom มาตัด)
          // แผนชุดถัดไปใช้วันที่การเปลี่ยนแปลงมีผล (effectiveFrom) เป็นขอบเขตเพิ่มเติม
          const planStartBoundary =
            plan.supersedesPlanId !== null && plan.effectiveFrom
              ? plan.effectiveFrom
              : anchorDateUtc;

          let initialStep = 0;
          if (planStartBoundary.getTime() > anchorDateUtc.getTime()) {
            const diffMs =
              planStartBoundary.getTime() - anchorDateUtc.getTime();
            if (config.frequency === 'DAILY') {
              const est = Math.floor(diffMs / (config.interval * 86400000));
              initialStep = Math.max(0, est - 2);
            } else if (config.frequency === 'WEEKLY') {
              const est = Math.floor(diffMs / (config.interval * 7 * 86400000));
              initialStep = Math.max(0, est - 2);
            } else if (config.frequency === 'MONTHLY') {
              const est = Math.floor(
                diffMs / (30.4 * 86400000 * config.interval),
              );
              initialStep = Math.max(0, est - 2);
            } else if (config.frequency === 'YEARLY') {
              const est = Math.floor(
                diffMs / (365.25 * 86400000 * config.interval),
              );
              initialStep = Math.max(0, est - 2);
            }
          }

          let step = initialStep;
          const eligibleRounds: Array<{
            opensAt: Date;
            dueAt: Date;
            occurrenceKey: string;
          }> = [];

          while (step < initialStep + 5000) {
            let year = anchorYear;
            let month = anchorMonth;
            let day = anchorDay;

            if (config.frequency === 'DAILY') {
              const d = new Date(
                Date.UTC(
                  anchorYear,
                  anchorMonth - 1,
                  anchorDay + step * config.interval,
                ),
              );
              year = d.getUTCFullYear();
              month = d.getUTCMonth() + 1;
              day = d.getUTCDate();
            } else if (config.frequency === 'WEEKLY') {
              const d = new Date(
                Date.UTC(
                  anchorYear,
                  anchorMonth - 1,
                  anchorDay + step * config.interval * 7,
                ),
              );
              year = d.getUTCFullYear();
              month = d.getUTCMonth() + 1;
              day = d.getUTCDate();
            } else if (config.frequency === 'MONTHLY') {
              const totalMonths = anchorMonth - 1 + step * config.interval;
              year = anchorYear + Math.floor(totalMonths / 12);
              month = (totalMonths % 12) + 1;
              const targetDay = anchorDay;
              const daysInMonth = new Date(
                Date.UTC(year, month, 0),
              ).getUTCDate();
              if (targetDay > daysInMonth) {
                if (config.invalidDayPolicy === 'SKIP') {
                  step++;
                  continue;
                } else {
                  day = daysInMonth;
                }
              } else {
                day = targetDay;
              }
            } else if (config.frequency === 'YEARLY') {
              year = anchorYear + step * config.interval;
              const targetDay = anchorDay;
              const daysInMonth = new Date(
                Date.UTC(year, month, 0),
              ).getUTCDate();
              if (
                targetDay > daysInMonth &&
                config.invalidDayPolicy === 'SKIP'
              ) {
                step++;
                continue;
              }
              day = Math.min(targetDay, daysInMonth);
            }

            const y = String(year).padStart(4, '0');
            const m = String(month).padStart(2, '0');
            const d = String(day).padStart(2, '0');
            const dateStr = `${y}-${m}-${d}`;

            if (config.endLocalDate && dateStr > config.endLocalDate) break;
            const occurrenceDate = localToUtc(dateStr, timeStr, plan.timezone);

            if (occurrenceDate > end) break;
            if (plan.effectiveUntil && occurrenceDate >= plan.effectiveUntil)
              break;

            if (occurrenceDate >= planStartBoundary) {
              const occurrenceKey = generateOccurrenceKey(
                plan.id,
                dateStr,
                plan.timezone,
              );
              eligibleRounds.push({
                opensAt: occurrenceDate,
                dueAt: calculateDueDate(
                  occurrenceDate,
                  config.dueOffset,
                  plan.timezone,
                ),
                occurrenceKey,
              });
            }

            step++;
          }

          if (plan.missedPolicy === 'CATCH_UP') {
            // CATCH_UP — สร้างรอบย้อนหลังที่ยังไม่มี ตั้งแต่วันเริ่มจนถึงปัจจุบัน
            rounds = eligibleRounds.filter(
              (r) =>
                !existingKeys.has(r.occurrenceKey) &&
                !existingOpensAt.has(r.opensAt.getTime()),
            );
          } else {
            // SKIP — ข้ามรอบที่พลาดไป โดยยังคำนวณจังหวะจากวันเริ่มเดิม
            const latestNominal = eligibleRounds[eligibleRounds.length - 1];
            if (
              latestNominal &&
              !existingKeys.has(latestNominal.occurrenceKey) &&
              !existingOpensAt.has(latestNominal.opensAt.getTime())
            ) {
              rounds = [latestNominal];
            } else {
              rounds = [];
            }
          }
        } else if (plan.scheduleKind === 'EXPLICIT') {
          const periods = await this.periodRepo!.findByPlanId(plan.id);
          const planStartBoundary =
            plan.supersedesPlanId !== null && plan.effectiveFrom
              ? plan.effectiveFrom
              : null;
          let eligiblePeriods = periods
            .filter(
              (period) =>
                (!planStartBoundary || period.opensAt >= planStartBoundary) &&
                period.opensAt <= end &&
                (!plan.effectiveUntil || period.opensAt < plan.effectiveUntil),
            )
            .sort((a, b) => a.opensAt.getTime() - b.opensAt.getTime());

          if (plan.missedPolicy === 'SKIP') {
            eligiblePeriods = eligiblePeriods.slice(-1);
          }

          rounds = eligiblePeriods
            .map((period) => ({
              ...period,
              periodId: period.id,
              occurrenceKey: `${plan.id}_period_${period.id}`,
            }))
            .filter(
              (r) =>
                !existingKeys.has(r.occurrenceKey) &&
                !existingOpensAt.has(r.opensAt.getTime()) &&
                !existingPeriodIds.has(r.periodId),
            );
        }

        // Deduplicate within the batch and cap at 100 rounds
        const distinctRounds: typeof rounds = [];
        const seenKeysInBatch = new Set<string>();
        const seenOpensAtInBatch = new Set<number>();
        const seenPeriodIdsInBatch = new Set<string>();

        for (const round of rounds) {
          if (
            existingKeys.has(round.occurrenceKey) ||
            seenKeysInBatch.has(round.occurrenceKey) ||
            existingOpensAt.has(round.opensAt.getTime()) ||
            seenOpensAtInBatch.has(round.opensAt.getTime())
          ) {
            continue;
          }
          if (
            round.periodId &&
            (existingPeriodIds.has(round.periodId) ||
              seenPeriodIdsInBatch.has(round.periodId))
          ) {
            continue;
          }
          seenKeysInBatch.add(round.occurrenceKey);
          seenOpensAtInBatch.add(round.opensAt.getTime());
          if (round.periodId) seenPeriodIdsInBatch.add(round.periodId);
          distinctRounds.push(round);
          if (distinctRounds.length >= 100) break;
        }

        rounds = distinctRounds;
        if (!rounds.length) return [];
        const targets = await this.targetRepo.findByPlanId(plan.id);
        const members = (
          await this.memberRepo!.findByOrganizationId(context.organizationId)
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
          } else if (target.organizationMemberId) {
            if (
              !members.some(
                (member) => member.id === target.organizationMemberId,
              )
            )
              throw new BadRequestError('Assigned member is inactive');
            memberIds.add(target.organizationMemberId);
          }
        }
        if (!roleIds.size && !memberIds.size)
          throw new BadRequestError('Plan has no recipients');
        const result: FormOccurrence[] = [];
        for (const round of rounds) {
          const occurrence = await this.occurrenceRepo.create({
            organizationId: context.organizationId,
            planId: plan.id,
            formTemplateId: plan.formTemplateId,
            formVersionId: version.id,
            opensAt: round.opensAt,
            dueAt: round.dueAt,
            occurrenceKey: round.occurrenceKey,
            periodId: round.periodId ?? null,
            revision: 1,
          });
          const existingAssignments =
            await this.assignmentRepo.findByOccurrenceId(occurrence.id);
          const activeRoleAssignments = new Set(
            existingAssignments
              .filter((a) => !a.cancelledAt && a.roleId)
              .map((a) => a.roleId!),
          );
          const activeMemberAssignments = new Set(
            existingAssignments
              .filter((a) => !a.cancelledAt && a.organizationMemberId)
              .map((a) => a.organizationMemberId!),
          );

          for (const roleId of roleIds) {
            if (!activeRoleAssignments.has(roleId)) {
              await this.assignmentRepo.create({
                organizationId: context.organizationId,
                occurrenceId: occurrence.id,
                formVersionId: version.id,
                roleId,
                revision: 1,
              });
              activeRoleAssignments.add(roleId);
            }
          }
          for (const organizationMemberId of memberIds) {
            if (!activeMemberAssignments.has(organizationMemberId)) {
              await this.assignmentRepo.create({
                organizationId: context.organizationId,
                occurrenceId: occurrence.id,
                formVersionId: version.id,
                organizationMemberId,
                revision: 1,
              });
              activeMemberAssignments.add(organizationMemberId);
            }
          }
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
    const organizationId =
      context.organizationId ?? context.activeOrganizationId;
    if (
      !occurrence ||
      (organizationId && occurrence.organizationId !== organizationId)
    ) {
      throw new NotFoundError('Occurrence not found');
    }

    requireRevisionMatch(
      occurrence.revision,
      context.expectedRevision,
      () => new BadRequestError('Optimistic concurrency check failed'),
      { optional: true },
    );

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
      context.organizationId,
      context.formTemplateId,
      context.planId,
    );
  }
}
