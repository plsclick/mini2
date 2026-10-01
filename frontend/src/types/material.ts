export interface Material {
  id: string;
  name: string;
  requiredQuantity: string;
  availableQuantity: string;
  requiredDate: string;
  expectedDelivery: string;
  status: "on-track" | "delayed";
  impact: string;
}
