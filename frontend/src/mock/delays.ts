import type { Delay } from "../types/delay";
export const delays: Delay[] = [
  {
    id: "delay-steel",
    task: "Structural Steel",
    days: 3,
    category: "material",
    impactDays: 3,
    affectedTasks: 4,
    status: "active",
  },
  {
    id: "delay-wiring",
    task: "Electrical Conduit",
    days: 1,
    category: "workforce",
    impactDays: 1,
    affectedTasks: 2,
    status: "active",
  },
];
