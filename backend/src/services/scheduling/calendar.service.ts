const MILLISECONDS_PER_DAY = 86_400_000;

export function toCalendarDay(value: Date | string): number {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return Number.NaN;
  return Math.floor(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) /
      MILLISECONDS_PER_DAY,
  );
}

export function fromCalendarDay(day: number): string {
  return new Date(day * MILLISECONDS_PER_DAY).toISOString().slice(0, 10);
}

export function durationInCalendarDays(start: Date | string, end: Date | string): number {
  return toCalendarDay(end) - toCalendarDay(start);
}
