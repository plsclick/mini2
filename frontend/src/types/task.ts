export type TaskStatus = "in-progress" | "at-risk" | "upcoming" | "complete";
export type TaskPriority = "high" | "medium" | "low";

export interface Task {
  id: string;
  name: string;
  stage: string;
  progress: number;
  status: TaskStatus;
  /** ISO date string or display string */
  expected: string;
  startDate?: string;
  endDate?: string;
  /** Duration in days */
  duration?: number;
  /** Total float / slack in days */
  slack?: number;
  /** IDs of predecessor tasks */
  dependencies?: string[];
  isCritical?: boolean;
  priority?: TaskPriority;
  assignedResource?: string;
  notes?: string;
}
