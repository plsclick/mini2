export interface ActivityItem {
  id: string;
  time: string;
  actor: string;
  action: string;
  type: "progress" | "delay" | "recovery" | "system";
}
