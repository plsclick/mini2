import { useMemo } from "react";
import { useTaskStore } from "../store/taskStore";

export type TimelineScale = "day" | "week" | "month";

export function useTimeline(scale: TimelineScale = "week") {
  const tasks = useTaskStore((s) => s.tasks);

  const criticalPath = useMemo(
    () => tasks.filter((t) => t.isCritical).sort((a, b) => (a.startDate ?? "").localeCompare(b.startDate ?? "")),
    [tasks],
  );

  const columns = useMemo(() => {
    if (scale === "day") {
      return ["12 OCT", "19 OCT", "26 OCT", "02 NOV", "09 NOV", "16 NOV", "23 NOV"];
    }
    if (scale === "month") {
      return ["OCTOBER", "NOVEMBER", "DECEMBER"];
    }
    return ["OCT 12", "OCT 19", "OCT 26", "NOV 02", "NOV 09", "NOV 16", "NOV 23"];
  }, [scale]);

  return { tasks, criticalPath, columns };
}
