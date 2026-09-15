import { RequirePermission } from '../../decorators/permission.decorator';
import type { IPreviewScheduleContext, IPreviewScheduleUseCase } from '@repo/domains/applications/form';
import type { IFormPlanPeriodRepository, IFormPlanRepository } from '@repo/domains/repositories/form';
import { BadRequestError, NotFoundError } from '../../lib/error';

export type ScheduleConfig = {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number;
  anchorLocalDate: string;
  openLocalTime: string;
  dayOfMonth?: number;
  invalidDayPolicy?: 'SKIP' | 'LAST_DAY';
  dueOffset: { amount: number; unit: 'ELAPSED_HOURS' | 'CALENDAR_DAYS' };
};

export function calculateNextOccurrences(
  config: ScheduleConfig,
  timezone: string,
  fromDate: Date,
  count: number,
  _clock: () => Date = () => new Date()
): Date[] {
  // Simple implementation for demonstration. A robust one would handle Intl properly.
  const results: Date[] = [];
  const current = new Date(fromDate.getTime());

  // Naive loop to generate dates
  for (let i = 0; i < count; i++) {
    // Add interval based on frequency
    if (config.frequency === 'DAILY') {
      current.setDate(current.getDate() + config.interval);
    } else if (config.frequency === 'WEEKLY') {
      current.setDate(current.getDate() + config.interval * 7);
    } else if (config.frequency === 'MONTHLY') {
      current.setMonth(current.getMonth() + config.interval);
    } else if (config.frequency === 'YEARLY') {
      current.setFullYear(current.getFullYear() + config.interval);
    }
    results.push(new Date(current.getTime()));
  }

  return results;
}

export function calculateDueDate(
  opensAt: Date,
  dueOffset: { amount: number; unit: 'ELAPSED_HOURS' | 'CALENDAR_DAYS' },
  _timezone: string
): Date {
  const result = new Date(opensAt.getTime());
  if (dueOffset.unit === 'ELAPSED_HOURS') {
    result.setHours(result.getHours() + dueOffset.amount);
  } else if (dueOffset.unit === 'CALENDAR_DAYS') {
    result.setDate(result.getDate() + dueOffset.amount);
  }
  return result;
}

export function generateOccurrenceKey(planId: string, localDate: string, timezone: string): string {
  return `${planId}:${localDate}:${timezone}`;
}

export class PreviewScheduleUseCase implements IPreviewScheduleUseCase {
  constructor(
    private readonly planRepo: IFormPlanRepository,
    private readonly periodRepo: IFormPlanPeriodRepository
  ) {}

  @RequirePermission('form_plan:read')
  async execute(context: IPreviewScheduleContext): Promise<Date[]> {
    const plan = await this.planRepo.findById(context.planId);
    if (!plan || plan.companyId !== context.companyId) {
      throw new NotFoundError('Form plan not found');
    }

    if (plan.scheduleKind === 'EXPLICIT') {
      const periods = await this.periodRepo.findByPlanId(plan.id);
      return periods.map(p => p.opensAt);
    }

    if (plan.scheduleKind === 'RECURRING') {
      if (!plan.scheduleConfig) {
        throw new BadRequestError('Invalid schedule config');
      }
      return calculateNextOccurrences(plan.scheduleConfig as ScheduleConfig, plan.timezone, new Date(), 10);
    }

    return [];
  }
}
