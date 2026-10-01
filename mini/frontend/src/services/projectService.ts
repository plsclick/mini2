import { stages } from "../mock/stages";
import { milestones } from "../mock/milestones";
import type { Project } from "../types/project";
import type { Stage } from "../types/stage";
import type { Milestone } from "../types/milestone";
import { api, fakeDelay } from "./api";

export interface ApiProject {
  id: string;
  name: string;
  description?: string | null;
  location?: string | null;
  status: string;
  progress: number;
  plannedStartDate?: string | null;
  plannedEndDate?: string | null;
  _count?: { stages: number; tasks: number; members: number };
}

export const projectService = {
  async listProjects(): Promise<ApiProject[]> {
    return api.get<ApiProject[]>("/projects");
  },

  async createProject(input: {
    name: string;
    description?: string;
    location?: string;
    clientId?: string;
    projectManagerId?: string;
    plannedStartDate?: string;
    plannedEndDate?: string;
  }): Promise<ApiProject> {
    return api.post<ApiProject>("/projects", input);
  },

  async getActiveProject(): Promise<Project> {
    throw new Error("Use listProjects to load projects from the API.");
  },

  async getStages(): Promise<Stage[]> {
    return fakeDelay(stages);
  },

  async getMilestones(): Promise<Milestone[]> {
    return fakeDelay(milestones);
  },

  async updateStageProgress(
    stageId: string,
    progress: number,
  ): Promise<Stage> {
    const stage = stages.find((s) => s.id === stageId);
    if (!stage) throw new Error(`Stage ${stageId} not found`);
    return fakeDelay({ ...stage, progress });
  },
};
