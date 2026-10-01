export type DependencyType = "finish-to-start";
export interface Dependency {
  id: string;
  predecessorId: string;
  successorId: string;
  type: DependencyType;
}
