import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuthStore } from "../store/authStore";
import { api, apiServerUrl } from "../services/api";
import type { ScheduleAnalysis } from "../types/schedule";

interface ProjectSummary {
  id: string;
  name: string;
}

interface ProjectScheduleState {
  schedule: ScheduleAnalysis | null;
  project: ProjectSummary | null;
  dashboard: DashboardSummary | null;
  isLoading: boolean;
  error: string | null;
}

export interface DashboardSummary {
  project: {
    id: string;
    name: string;
    status: string;
    progress: number;
    plannedStartDate: string | null;
    plannedEndDate: string | null;
  };
  statistics: {
    totalTasks: number;
    completedTasks: number;
    activeDelays: number;
    activeDelayDays: number;
    activeRisks: number;
    riskWeight: number;
    resources: number;
    averageTaskProgress: number;
  };
}

export function useProjectSchedule() {
  const token = useAuthStore((state) => state.token);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<ProjectScheduleState>({
    schedule: null,
    project: null,
    dashboard: null,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    let active = true;
    if (!token) {
      setProjectId(null);
      setState({ schedule: null, project: null, dashboard: null, isLoading: false, error: "Sign in with a backend account to load the live schedule." });
      return () => { active = false; };
    }

    setProjectId(null);
    setState({ schedule: null, project: null, dashboard: null, isLoading: true, error: null });
    void api.get<ProjectSummary[]>("/projects")
      .then((projects) => {
        const requestedProjectId = new URLSearchParams(window.location.search).get("project");
        const project = projects.find((item) => item.id === requestedProjectId) ?? projects[0];
        if (!project) throw new Error("No project is available for this account.");
        if (active) {
          setProjectId(project.id);
          setState((current) => ({ ...current, project }));
        }
        return Promise.all([
          api.get<ScheduleAnalysis>(`/projects/${project.id}/schedule`),
          api.get<DashboardSummary>(`/projects/${project.id}/dashboard`),
        ] as const);
      })
      .then(([schedule, dashboard]) => {
        if (active) setState((current) => ({ ...current, schedule, dashboard, isLoading: false, error: null }));
      })
      .catch((cause: unknown) => {
        if (active) setState({
          schedule: null,
          project: null,
          dashboard: null,
          isLoading: false,
          error: cause instanceof Error ? cause.message : "Could not load the project schedule.",
        });
      });

    return () => { active = false; };
  }, [token, reloadKey]);

  useEffect(() => {
    if (!token || !projectId) return;
    const socket = io(apiServerUrl, { auth: { token } });
    const handleScheduleUpdate = (event: { projectId?: string; id?: string }) => {
      if ((event.projectId ?? event.id) === projectId) setReloadKey((current) => current + 1);
    };
    socket.on("connect", () => socket.emit("join:project", projectId));
    socket.on("schedule:updated", handleScheduleUpdate);
    socket.on("project:updated", handleScheduleUpdate);
    return () => {
      socket.emit("leave:project", projectId);
      socket.disconnect();
    };
  }, [token, projectId]);

  return { ...state, projectId, refresh: () => setReloadKey((current) => current + 1) };
}
