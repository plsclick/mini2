export type ProjectStatus = "on-track" | "at-risk" | "delayed" | "complete";

export interface ProjectHealth {
  overall: number;
  schedule: number;
  execution: number;
  resources: number;
  risk: number;
}

export interface Project {
  id: string;
  name: string;
  type: string;
  location: string;
  progress: number;
  plannedCompletion: string;
  projectedCompletion: string;
  varianceDays: number;
  status?: ProjectStatus;
  health?: ProjectHealth;
}
