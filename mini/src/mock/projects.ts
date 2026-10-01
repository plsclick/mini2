import type { Project } from "../types/project";

export const activeProject: Project = {
  id: "skyline",
  name: "Skyline Residency",
  type: "Residential Tower",
  location: "Mumbai",
  progress: 72,
  plannedCompletion: "18 Dec 2026",
  projectedCompletion: "22 Dec 2026",
  varianceDays: 4,
  status: "at-risk",
  health: {
    overall: 82,
    schedule: 76,
    execution: 84,
    resources: 89,
    risk: 68,
  },
};
