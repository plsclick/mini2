import { activeTasks } from "../mock/tasks";
import type { Task } from "../types/task";
import { fakeDelay } from "./api";

export const taskService = {
  async getTasks(): Promise<Task[]> {
    return fakeDelay(activeTasks);
  },

  async getTask(id: string): Promise<Task | null> {
    return fakeDelay(activeTasks.find((t) => t.id === id) ?? null);
  },

  async updateProgress(
    id: string,
    progress: number,
    notes?: string,
  ): Promise<Task> {
    const task = activeTasks.find((t) => t.id === id);
    if (!task) throw new Error(`Task ${id} not found`);
    const updated: Task = { ...task, progress, notes };
    return fakeDelay(updated);
  },

  async createTask(task: Omit<Task, "id">): Promise<Task> {
    return fakeDelay({ ...task, id: crypto.randomUUID() });
  },

  async deleteTask(id: string): Promise<void> {
    return fakeDelay(undefined);
  },
};
