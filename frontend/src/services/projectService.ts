import { activeProject } from "../mock/projects";
import { stages } from "../mock/stages";
import { milestones } from "../mock/milestones";
import type { Project } from "../types/project";
import type { Stage } from "../types/stage";
import type { Milestone } from "../types/milestone";
import { fakeDelay } from "./api";

export const projectService = {
  async getActiveProject(): Promise<Project> {
    return fakeDelay(activeProject);
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
