export type RiskLevel = "high" | "medium" | "low";
export interface Risk {
  id: string;
  source: string;
  task: string;
  level: RiskLevel;
  impact: string;
  probability: number;
  status: "active" | "resolved";
}
