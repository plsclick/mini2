import { useEffect, useState } from "react";
import { api } from "../services/api";

export interface ActiveProject {
  id: string;
  name: string;
  description?: string | null;
  location?: string | null;
  status: string;
  progress: number;
  plannedStartDate?: string | null;
  plannedEndDate?: string | null;
  client?: { id: string; name: string; email: string } | null;
  projectManager?: { id: string; name: string; email: string } | null;
  _count?: { stages: number; tasks: number; members: number };
}

export function useActiveProject() {
  const [projects, setProjects] = useState<ActiveProject[]>([]);
  const [project, setProject] = useState<ActiveProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    void api.get<ActiveProject[]>("/projects")
      .then((result) => {
        if (!active) return;
        const requestedId = new URLSearchParams(window.location.search).get("project");
        setProjects(result);
        setProject(result.find((item) => item.id === requestedId) ?? result[0] ?? null);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Could not load projects.");
      })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  return { projects, project, isLoading, error };
}
