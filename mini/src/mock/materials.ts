import type { Material } from "../types/material";
export const materials: Material[] = [
  {
    id: "steel",
    name: "Steel",
    requiredQuantity: "500 kg",
    availableQuantity: "280 kg",
    requiredDate: "18 Nov",
    expectedDelivery: "21 Nov",
    status: "delayed",
    impact: "+3 days",
  },
  {
    id: "conduit",
    name: "Electrical conduit",
    requiredQuantity: "1,200 m",
    availableQuantity: "920 m",
    requiredDate: "25 Nov",
    expectedDelivery: "24 Nov",
    status: "on-track",
    impact: "None",
  },
];
