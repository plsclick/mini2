export interface RecoveryOption {
  id: string;
  name: string;
  recoveryDays: number;
  affectedTasks: number;
  resourceRequirement: string;
  risk: string;
  status: "recommended" | "available";
}
