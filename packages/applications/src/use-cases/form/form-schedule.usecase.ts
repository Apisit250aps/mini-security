import { formScheduleConfigSchema } from '@repo/domains/schema/form';
import { RequirePermission } from '../../decorators/permission.decorator';
import type {
  IPreviewScheduleContext,
  IPreviewScheduleUseCase,
} from '@repo/domains/applications/form';
import type {
  IFormPlanPeriodRepository,
  IFormPlanRepository,
} from '@repo/domains/repositories/form';
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

function localToUtc(
  localDateStr: string,
  localTimeStr: string,
  timezone: string,
): Date {
  const dateParts = localDateStr.split('-');
  const year = Number(dateParts[0]) || 2026;
  const month = Number(dateParts[1]) || 1;
  const day = Number(dateParts[2]) || 1;

  const timeParts = (localTimeStr || '00:00').split(':');
  const hour = Number(timeParts[0]) || 0;
  const minute = Number(timeParts[1]) || 0;

  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0));

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(utcGuess);
  const getPart = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value || 0);

  const tzYear = getPart('year');
  const tzMonth = getPart('month');
  const tzDay = getPart('day');
  let tzHour = getPart('hour');
  if (tzHour === 24) tzHour = 0;
  const tzMinute = getPart('minute');

  const tzAsUtc = Date.UTC(tzYear, tzMonth - 1, tzDay, tzHour, tzMinute, 0, 0);
  const offset = tzAsUtc - utcGuess.getTime();

  return new Date(utcGuess.getTime() - offset);
}

function formatDateISO(year: number, month: number, day: number): string {
  const y = String(year).padStart(4, '0');
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function calculateNextOccurrences(
  config: ScheduleConfig,
  timezone: string,
  fromDate: Date,
  count: number,
  includePrevious = false,
): Date[] {
  const validation = formScheduleConfigSchema.safeParse(config);
  if (!validation.success)
    throw new BadRequestError('Invalid recurring schedule');
  const results: Date[] = [];
  const anchorParts = (config.anchorLocalDate || '2026-01-01').split('-');
  const anchorYear = Number(anchorParts[0]) || 2026;
  const anchorMonth = Number(anchorParts[1]) || 1;
  const anchorDay = Number(anchorParts[2]) || 1;

  const timeStr = config.openLocalTime || '00:00';
  const anchorDateUtc = localToUtc(config.anchorLocalDate, timeStr, timezone);

  let initialStep = 0;
  if (fromDate.getTime() > anchorDateUtc.getTime()) {
    const diffMs = fromDate.getTime() - anchorDateUtc.getTime();
    if (config.frequency === 'DAILY') {
      const stepEstimate = Math.floor(diffMs / (config.interval * 86400000));
      initialStep = Math.max(0, stepEstimate - 2);
    } else if (config.frequency === 'WEEKLY') {
      const stepEstimate = Math.floor(
        diffMs / (config.interval * 7 * 86400000),
      );
      initialStep = Math.max(0, stepEstimate - 2);
    } else if (config.frequency === 'MONTHLY') {
      const approxMonths = Math.floor(diffMs / (30.4 * 86400000));
      const stepEstimate = Math.floor(approxMonths / config.interval);
      initialStep = Math.max(0, stepEstimate - 2);
    } else if (config.frequency === 'YEARLY') {
      const approxYears = Math.floor(diffMs / (365.25 * 86400000));
      const stepEstimate = Math.floor(approxYears / config.interval);
      initialStep = Math.max(0, stepEstimate - 2);
    }
  }

  let step = initialStep;
  while (results.length < count && step < initialStep + 500) {
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
      const targetDay = config.dayOfMonth ?? anchorDay;
      const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
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
      const targetDay = config.dayOfMonth ?? anchorDay;
      const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
      if (targetDay > daysInMonth && config.invalidDayPolicy === 'SKIP') {
        step++;
        continue;
      }
      day = Math.min(targetDay, daysInMonth);
    }

    const dateStr = formatDateISO(year, month, day);
    const occurrenceDate = localToUtc(dateStr, timeStr, timezone);

    if (includePrevious || occurrenceDate >= fromDate)
      results.push(occurrenceDate);
    step++;
  }

  return results;
}

export function calculateDueDate(
  opensAt: Date,
  dueOffset: { amount: number; unit: 'ELAPSED_HOURS' | 'CALENDAR_DAYS' },
  timezone: string,
): Date {
  const result = new Date(opensAt.getTime());
  if (dueOffset.unit === 'ELAPSED_HOURS') {
    result.setTime(result.getTime() + dueOffset.amount * 3600 * 1000);
  } else if (dueOffset.unit === 'CALENDAR_DAYS') {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(opensAt);
    const part = (name: string) =>
      Number(parts.find((p) => p.type === name)?.value);
    const local = new Date(
      Date.UTC(part('year'), part('month') - 1, part('day') + dueOffset.amount),
    );
    return localToUtc(
      formatDateISO(
        local.getUTCFullYear(),
        local.getUTCMonth() + 1,
        local.getUTCDate(),
      ),
      `${part('hour')}:${part('minute')}`,
      timezone,
    );
  }
  return result;
}

export function generateOccurrenceKey(
  planId: string,
  localDate: string,
  timezone: string,
): string {
  return `${planId}:${localDate}:${timezone}`;
}

export class PreviewScheduleUseCase implements IPreviewScheduleUseCase {
  constructor(
    private readonly planRepo: IFormPlanRepository,
    private readonly periodRepo: IFormPlanPeriodRepository,
  ) {}

  @RequirePermission('form_plan:read')
  async execute(context: IPreviewScheduleContext): Promise<Date[]> {
    const plan = await this.planRepo.findById(context.planId);
    if (!plan || plan.companyId !== context.companyId) {
      throw new NotFoundError('Form plan not found');
    }

    if (plan.scheduleKind === 'EXPLICIT') {
      const periods = await this.periodRepo.findByPlanId(plan.id);
      return periods.map((p) => p.opensAt);
    }

    if (plan.scheduleKind === 'RECURRING') {
      if (!plan.scheduleConfig) {
        throw new BadRequestError('Invalid schedule config');
      }
      return calculateNextOccurrences(
        plan.scheduleConfig as ScheduleConfig,
        plan.timezone,
        new Date(),
        10,
      );
    }

    return [];
  }
}
