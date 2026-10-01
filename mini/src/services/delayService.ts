import type { Delay } from "../types/delay";
export const delayService = {
  async report(
    delay: Omit<Delay, "id" | "impactDays" | "affectedTasks" | "status">,
  ) {
    return {
      ...delay,
      id: crypto.randomUUID(),
      impactDays: delay.days,
      affectedTasks: 4,
      status: "active" as const,
    };
  },
};
