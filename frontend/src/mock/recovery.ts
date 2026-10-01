import type { RecoveryOption } from "../types/recovery";
export const recoveryOptions: RecoveryOption[] = [
  {
    id: "expedite",
    name: "Expedite material",
    recoveryDays: 2,
    affectedTasks: 4,
    resourceRequirement: "Priority freight",
    risk: "Cost increase",
    status: "recommended",
  },
  {
    id: "workforce",
    name: "Additional workforce",
    recoveryDays: 1,
    affectedTasks: 2,
    resourceRequirement: "6 steel workers",
    risk: "Shift coordination",
    status: "available",
  },
  {
    id: "parallel",
    name: "Parallel preparation work",
    recoveryDays: 2,
    affectedTasks: 3,
    resourceRequirement: "Electrical crew",
    risk: "Access constraint",
    status: "available",
  },
];
