import { create } from "zustand";
import { activeProject } from "../mock/projects";
export const useProjectStore = create(() => ({
  activeProject,
  selectProject: () => undefined,
}));
