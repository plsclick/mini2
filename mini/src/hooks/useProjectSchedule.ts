import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuthStore } from "../store/authStore";
import { activeProject } from "../mock/projects";
import { api, apiServerUrl } from "../services/api";
import type { ScheduleAnalysis } from "../types/schedule";

interface ProjectSummary {
  id: string;
  name: string;
}

interface ProjectScheduleState {
  schedule: ScheduleAnalysis | null;
  isLoading: boolean;
  error: string | null;
}

export function useProjectSchedule() {
  const token = useAuthStore((state) => state.token);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<ProjectScheduleState>({
    schedule: null,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    let active = true;
    if (!token) {
      setProjectId(null);
      setState({ schedule: null, isLoading: false, error: "Sign in with a backend account to load the live schedule." });
      return () => { active = false; };
    }

    setProjectId(null);
    setState({ schedule: null, isLoading: true, error: null });
    void api.get<ProjectSummary[]>("/projects")
      .then((projects) => {
        const project = projects.find((item) => item.name === activeProject.name) ?? projects[0];
        if (!project) throw new Error("No project is available for this account.");
        if (active) setProjectId(project.id);
        return api.get<ScheduleAnalysis>(`/projects/${project.id}/schedule`);
      })
      .then((schedule) => {
        if (active) setState({ schedule, isLoading: false, error: null });
      })
      .catch((cause: unknown) => {
        if (active) setState({
          schedule: null,
          isLoading: false,
          error: cause instanceof Error ? cause.message : "Could not load the project schedule.",
        });
      });

    return () => { active = false; };
  }, [token, reloadKey]);

  useEffect(() => {
    if (!token || !projectId) return;
    const socket = io(apiServerUrl, { auth: { token } });
    const handleScheduleUpdate = (event: { projectId?: string }) => {
      if (event.projectId === projectId) setReloadKey((current) => current + 1);
    };
    socket.on("connect", () => socket.emit("join:project", projectId));
    socket.on("schedule:updated", handleScheduleUpdate);
    return () => {
      socket.emit("leave:project", projectId);
      socket.disconnect();
    };
  }, [token, projectId]);

  return { ...state, refresh: () => setReloadKey((current) => current + 1) };
}
