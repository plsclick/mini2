export interface Milestone {
  id: string;
  name: string;
  plannedDate: string;
  projectedDate: string;
  status: "complete" | "in-progress" | "upcoming";
  dependency: string;
}
