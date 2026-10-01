import { create } from "zustand";
import { stages as initialStages } from "../mock/stages";
import type { Stage } from "../types/stage";

interface StageState {
  stages: Stage[];
  updateProgress: (id: string, progress: number) => void;
  addStage: (stage: Omit<Stage, "id">) => void;
  removeStage: (id: string) => void;
}

export const useStageStore = create<StageState>((set) => ({
  stages: initialStages,

  updateProgress: (id, progress) =>
    set((state) => ({
      stages: state.stages.map((s) =>
        s.id === id ? { ...s, progress } : s,
      ),
    })),

  addStage: (stage) =>
    set((state) => ({
      stages: [
        ...state.stages,
        { ...stage, id: `stage-${Date.now()}` },
      ],
    })),

  removeStage: (id) =>
    set((state) => ({
      stages: state.stages.filter((s) => s.id !== id),
    })),
}));
