/** Basic validation helpers used across form components */

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isStrongPassword(password: string): boolean {
  return password.length >= 8;
}

export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}

export function isPositiveNumber(value: string | number): boolean {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return !isNaN(n) && n > 0;
}

/** Returns first failing rule message, or null if all pass */
export function validateField(
  value: string,
  rules: Array<{ check: (v: string) => boolean; message: string }>,
): string | null {
  for (const rule of rules) {
    if (!rule.check(value)) return rule.message;
  }
  return null;
}
