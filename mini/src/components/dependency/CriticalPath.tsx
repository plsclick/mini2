import {
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import type { ScheduleAnalysis } from "../../types/schedule";

export function CriticalPath({ schedule, criticalOnly = false }: { schedule: ScheduleAnalysis | null; criticalOnly?: boolean }) {
  if (!schedule || schedule.tasks.length === 0) {
    return <div className="reactflow schedule-empty">No scheduled tasks to display.</div>;
  }

  const dayValue = (date: string) => Date.parse(`${date}T00:00:00Z`) / 86_400_000;
  const scheduleStart = dayValue(schedule.projectStartDate ?? schedule.tasks[0].earliestStart);
  const duration = Math.max(schedule.totalDurationDays, 1);
  const criticalEdges = new Set(schedule.criticalPaths.flatMap((path) =>
    path.slice(1).map((taskId, index) => `${path[index]}:${taskId}`),
  ));
  const visibleTasks = criticalOnly
    ? schedule.tasks.filter((task) => task.isCritical)
    : schedule.tasks;
  const visibleIds = new Set(visibleTasks.map((task) => task.taskId));
  const nodes: Node[] = visibleTasks.map((task, index) => {
    const startOffset = dayValue(task.earliestStart) - scheduleStart;
    return {
      id: task.taskId,
      position: { x: (startOffset / duration) * 760, y: index * 84 },
      data: {
        label: (
          <div className={`flow-node ${task.isCritical ? "critical" : ""}`}>
            <small>{task.isCritical ? "CRITICAL TASK" : `${task.totalFloat} DAYS FLOAT`}</small>
            <b>{task.name}</b>
            <span>{task.earliestStart} · {task.durationDays}d</span>
          </div>
        ),
      },
    };
  });
  const edges: Edge[] = schedule.dependencies
    .filter((dependency) => visibleIds.has(dependency.predecessorTaskId) && visibleIds.has(dependency.successorTaskId))
    .map((dependency) => {
      const critical = criticalEdges.has(`${dependency.predecessorTaskId}:${dependency.successorTaskId}`);
      return {
        id: dependency.id,
        source: dependency.predecessorTaskId,
        target: dependency.successorTaskId,
        label: `${dependency.dependencyType.replaceAll("_TO_", "→")}${dependency.lagDays ? ` +${dependency.lagDays}d` : ""}`,
        animated: critical,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: critical ? "#e45a5a" : "#647181", strokeWidth: critical ? 2 : 1 },
      };
    });

  return (
    <div className="reactflow">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
      >
        <Background gap={18} color="#26303d" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
