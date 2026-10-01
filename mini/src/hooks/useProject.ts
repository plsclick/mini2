import { useProjectStore } from "../store/projectStore";

export function useProject() {
  const activeProject = useProjectStore((s) => s.activeProject);
  const selectProject = useProjectStore((s) => s.selectProject);

  const isDelayed = (activeProject?.varianceDays ?? 0) > 0;
  const isAtRisk = activeProject?.status === "at-risk";

  return { activeProject, selectProject, isDelayed, isAtRisk };
}
