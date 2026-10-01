import { api } from "./api";

export interface ProjectUser {
  id: string;
  name: string;
  email: string;
  role: "CLIENT" | "PROJECT_MANAGER" | "CONSTRUCTION_MANAGER";
  avatarUrl?: string | null;
}

export interface ApiStage {
  id: string;
  name: string;
  description?: string | null;
  order: number;
  status: string;
  progress: number;
  plannedStartDate?: string | null;
  plannedEndDate?: string | null;
  _count?: { tasks: number };
}

export interface ApiTask {
  id: string;
  projectId: string;
  stageId?: string | null;
  name: string;
  description?: string | null;
  status: string;
  priority?: string | null;
  progress: number;
  plannedStartDate?: string | null;
  plannedEndDate?: string | null;
  estimatedHours?: number | null;
  assignedTo?: ProjectUser | null;
  stage?: { id: string; name: string } | null;
}

export interface ApiResource {
  id: string;
  name: string;
  type: string;
  quantity: number;
  unit: string | null;
  status: string;
  cost: number | null;
}

export interface ApiMaterial {
  id: string;
  name: string;
  quantityRequired: number;
  quantityAvailable: number;
  unit: string | null;
  status: string;
  expectedDeliveryDate: string | null;
  supplier: string | null;
}

export interface ApiRisk {
  id: string;
  title: string;
  severity: string;
  status: string;
  impact: number;
  description?: string | null;
}

export interface ApiActivity {
  id: string;
  action: string;
  description: string;
  createdAt: string;
  user?: { name: string } | null;
}

export interface ApiMilestone {
  id: string;
  name: string;
  plannedDate: string;
  actualDate: string | null;
  status: string;
  task?: { name: string } | null;
}

export const projectDataService = {
  listUsers: () => api.get<ProjectUser[]>("/users"),
  listStages: (projectId: string) => api.get<ApiStage[]>(`/projects/${projectId}/stages`),
  createStage: (projectId: string, body: unknown) => api.post<ApiStage>(`/projects/${projectId}/stages`, body),
  listTasks: (projectId: string) => api.get<ApiTask[]>(`/projects/${projectId}/tasks`),
  createTask: (projectId: string, body: unknown) => api.post<ApiTask>(`/projects/${projectId}/tasks`, body),
  updateTask: (taskId: string, body: unknown) => api.put<ApiTask>(`/tasks/${taskId}`, body),
  deleteTask: (taskId: string) => api.delete(`/tasks/${taskId}`),
  listResources: (projectId: string) => api.get<ApiResource[]>(`/projects/${projectId}/resources`),
  createResource: (projectId: string, body: unknown) => api.post<ApiResource>(`/projects/${projectId}/resources`, body),
  listMaterials: (projectId: string) => api.get<ApiMaterial[]>(`/projects/${projectId}/materials`),
  createMaterial: (projectId: string, body: unknown) => api.post<ApiMaterial>(`/projects/${projectId}/materials`, body),
  listRisks: (projectId: string) => api.get<ApiRisk[]>(`/projects/${projectId}/risks`),
  listActivity: (projectId: string) => api.get<ApiActivity[]>(`/projects/${projectId}/activity`),
  listMilestones: (projectId: string) => api.get<ApiMilestone[]>(`/projects/${projectId}/milestones`),
  listDependencies: (projectId: string) => api.get<Array<{ id: string; predecessorTaskId: string; successorTaskId: string; dependencyType: string; lagDays: number }>>(`/projects/${projectId}/dependencies`),
  createDependency: (projectId: string, body: unknown) => api.post(`/projects/${projectId}/dependencies`, body),
  createMember: (projectId: string, body: unknown) => api.post(`/projects/${projectId}/members`, body),
};
