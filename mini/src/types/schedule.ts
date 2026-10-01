export interface ScheduleDependency {
  id: string;
  projectId: string;
  predecessorTaskId: string;
  successorTaskId: string;
  dependencyType: "FINISH_TO_START" | "START_TO_START" | "FINISH_TO_FINISH" | "START_TO_FINISH";
  lagDays: number;
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
