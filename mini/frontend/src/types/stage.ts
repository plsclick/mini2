export type StageStatus = "complete" | "in-progress" | "at-risk" | "upcoming";

export interface Stage {
  id: string;
  name: string;
  progress: number;
  taskCount: number;
  plannedEnd: string;
  projectedEnd: string;
  risk: "high" | "medium" | "low";
  status: StageStatus;
  delayDays?: number;
}
