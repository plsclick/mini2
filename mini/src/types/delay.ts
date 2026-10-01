export type DelayCategory =
  | "material"
  | "workforce"
  | "equipment"
  | "weather"
  | "site-issue"
  | "approval"
  | "other";
export interface Delay {
  id: string;
  task: string;
  days: number;
  category: DelayCategory;
  impactDays: number;
  affectedTasks: number;
  status: "active" | "resolved";
}
