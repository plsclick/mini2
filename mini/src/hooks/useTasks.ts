import { useTaskStore } from "../store/taskStore";

export function useTasks() {
  const tasks = useTaskStore((s) => s.tasks);
  const updateProgress = useTaskStore((s) => s.updateProgress);

  const criticalTasks = tasks.filter((t) => t.isCritical);
  const delayedTasks = tasks.filter((t) => t.status === "at-risk");
  const activeTasks = tasks.filter(
    (t) => t.status === "in-progress" || t.status === "at-risk",
  );

  return { tasks, criticalTasks, delayedTasks, activeTasks, updateProgress };
}
