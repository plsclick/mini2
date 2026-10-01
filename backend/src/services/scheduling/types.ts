export type DependencyType =
  | "FINISH_TO_START"
  | "START_TO_START"
  | "FINISH_TO_FINISH"
  | "START_TO_FINISH";

export interface ScheduleProject {
  id: string;
  plannedStartDate: Date | string | null;
}

export interface ScheduleTask {
  id: string;
  projectId: string;
  name: string;
  stageName?: string | null;
  status: string;
  plannedStartDate: Date | string | null;
  plannedEndDate: Date | string | null;
}

export interface ScheduleOptions {
  taskDelayOffsets?: Readonly<Record<string, number>>;
}

export interface ScheduleDependency {
  id: string;
  projectId: string;
  predecessorTaskId: string;
  successorTaskId: string;
  dependencyType: DependencyType;
  lagDays: number;
}

export interface ScheduleIssue {
  code: string;
  message: string;
  taskIds?: string[];
  dependencyId?: string;
}

export interface ScheduleValidationResult {
  valid: boolean;
  errors: ScheduleIssue[];
}

export interface ScheduledTask {
  taskId: string;
  name: string;
  stageName: string | null;
  status: string;
  durationDays: number;
  plannedStartDate: string;
  plannedEndDate: string;
  earliestStart: string;
  earliestFinish: string;
  latestStart: string;
  latestFinish: string;
  totalFloat: number;
  isCritical: boolean;
  predecessors: string[];
  successors: string[];
}

export interface ScheduleAnalysis {
  projectId: string;
  projectStartDate: string | null;
  projectEndDate: string | null;
  calculatedCompletionDate: string | null;
  totalDurationDays: number;
  tasks: ScheduledTask[];
  criticalTasks: string[];
  criticalPaths: string[][];
  criticalPathsTruncated: boolean;
  dependencies: ScheduleDependency[];
  statistics: {
    totalTasks: number;
    completedTasks: number;
    criticalTaskCount: number;
    nonCriticalTaskCount: number;
  };
}

export interface TaskTiming {
  duration: number;
  earliestStart: number;
  earliestFinish: number;
  latestStart: number;
  latestFinish: number;
  totalFloat: number;
  isCritical: boolean;
}

export interface DependencyGraph {
  taskIds: string[];
  predecessors: Map<string, ScheduleDependency[]>;
  successors: Map<string, ScheduleDependency[]>;
  topologicalOrder: string[];
}
