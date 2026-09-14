export function calculateLeaveDays(request: {
  startDate: string;
  endDate: string;
  unit: 'day' | 'half_day' | 'hour';
  startTime?: string | null;
  endTime?: string | null;
  minutesPerDaySnapshot?: number | null;
}): number {
  if (request.unit === 'half_day') {
    return 0.5;
  }
  if (request.unit === 'hour') {
    if (
      !request.startTime ||
      !request.endTime ||
      !request.minutesPerDaySnapshot
    ) {
      return 0;
    }
    const startParts = request.startTime.split(':').map(Number);
    const endParts = request.endTime.split(':').map(Number);
    const sh = startParts[0] ?? 0;
    const sm = startParts[1] ?? 0;
    const eh = endParts[0] ?? 0;
    const em = endParts[1] ?? 0;
    const diffMinutes = eh * 60 + em - (sh * 60 + sm);
    if (diffMinutes <= 0) {
      return 0;
    }
    return Number((diffMinutes / request.minutesPerDaySnapshot).toFixed(2));
  }
  // unit === 'day'
  const start = new Date(`${request.startDate}T00:00:00Z`);
  const end = new Date(`${request.endDate}T00:00:00Z`);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diffDays);
}
