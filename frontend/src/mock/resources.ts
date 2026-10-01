import type { Resource } from "../types/resource";
export const resources: Resource[] = [
  {
    id: "workforce",
    name: "Site workforce",
    category: "workforce",
    assigned: "296 / 320 assigned",
    utilization: 92,
    status: "active",
  },
  {
    id: "crane",
    name: "Crane #02",
    category: "equipment",
    assigned: "Structure and steel",
    utilization: 76,
    status: "active",
  },
  {
    id: "steel",
    name: "Steel rods",
    category: "material",
    assigned: "280 / 500 kg available",
    utilization: 56,
    status: "delayed",
  },
];
