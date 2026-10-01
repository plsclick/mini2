/**
 * Lightweight date utilities. No external dependency — keeps the bundle lean.
 * Dates are treated as display strings (e.g. "18 Nov 2026") throughout the mock layer.
 */

const MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

/** Parse "18 Nov 2026" or "18 Nov" (assumes current year) */
export function parseDisplayDate(s: string): Date | null {
  const parts = s.trim().split(" ");
  if (parts.length < 2) return null;
  const day = parseInt(parts[0], 10);
  const month = MONTHS[parts[1]];
  const year = parts[2] ? parseInt(parts[2], 10) : new Date().getFullYear();
  if (isNaN(day) || month === undefined) return null;
  return new Date(year, month, day);
}

/** Format a Date to "18 Nov 2026" */
export function formatDisplayDate(d: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/** Days between two display-date strings. Positive = b is later. */
export function daysBetween(a: string, b: string): number {
  const da = parseDisplayDate(a);
  const db = parseDisplayDate(b);
  if (!da || !db) return 0;
  return Math.round((db.getTime() - da.getTime()) / 86_400_000);
}

/** Returns true if display-date string is today or in the past */
export function isPast(s: string): boolean {
  const d = parseDisplayDate(s);
  if (!d) return false;
  return d <= new Date();
}

/** "10 min ago", "Yesterday", etc. — for activity timestamps already formatted */
export function relativeTime(s: string): string {
  return s; // mock layer already provides relative strings
}
