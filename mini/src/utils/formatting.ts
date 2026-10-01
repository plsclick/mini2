/** Format a number as a percentage string: 72 → "72%" */
export function pct(value: number): string {
  return `${Math.round(value)}%`;
}

/** Format days variance: positive is delay, negative is ahead */
export function varianceDays(days: number): string {
  if (days === 0) return "On schedule";
  return days > 0 ? `+${days} days` : `${days} days`;
}

/** Capitalise first letter */
export function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Convert kebab-case / snake_case to Title Case */
export function toTitleCase(s: string): string {
  return s.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Truncate a string to maxLen characters */
export function truncate(s: string, maxLen = 40): string {
  return s.length > maxLen ? `${s.slice(0, maxLen - 1)}…` : s;
}

/** Risk level label: "high" → "HIGH RISK" */
export function riskLabel(level: "high" | "medium" | "low"): string {
  const map = { high: "HIGH RISK", medium: "MEDIUM RISK", low: "LOW RISK" };
  return map[level];
}
