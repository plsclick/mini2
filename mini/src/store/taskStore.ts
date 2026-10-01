import { create } from "zustand";
import { activeTasks } from "../mock/tasks";
import type { Task } from "../types/task";

interface TaskState {
  tasks: Task[];
  updateProgress: (id: string, progress: number) => void;
  addTask: (task: Omit<Task, "id">) => void;
  removeTask: (id: string) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: activeTasks,

  updateProgress: (id, progress) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, progress } : t,
      ),
    })),

  addTask: (task) =>
    set((state) => ({
      tasks: [...state.tasks, { ...task, id: `task-${Date.now()}` }],
    })),

  removeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    })),
}));
