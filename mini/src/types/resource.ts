export type ResourceCategory = "workforce" | "equipment" | "material";
export interface Resource {
  id: string;
  name: string;
  category: ResourceCategory;
  assigned: string;
  utilization: number;
  status: "active" | "available" | "delayed";
}
