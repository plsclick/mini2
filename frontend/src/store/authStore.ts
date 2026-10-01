import { create } from "zustand";
import type { User, UserRole } from "../types/user";
import { api, apiTokenStorageKey } from "../services/api";

interface ApiUser {
  id: string;
  name: string;
  role: "CLIENT" | "PROJECT_MANAGER" | "CONSTRUCTION_MANAGER";
}

interface AuthResponse {
  token: string;
  user: ApiUser;
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  organizationName: string;
  role: "CLIENT" | "PROJECT_MANAGER" | "CONSTRUCTION_MANAGER";
}

function toAppUser(user: ApiUser): User {
  const role: UserRole = user.role === "CLIENT" ? "client" : user.role === "PROJECT_MANAGER" ? "pm" : "cm";
  const initials = user.name.split(/\s+/).slice(0, 2).map((part) => part[0] ?? "").join("").toUpperCase();
  return { id: user.id, name: user.name, role, initials };
}

function storedUser(): User | null {
  try {
    const value = localStorage.getItem("buildpulse.user");
    return value ? JSON.parse(value) as User : null;
  } catch {
    return null;
  }
}

interface AuthState {
  user: User | null;
  token: string | null;
  authenticate: (email: string, password: string) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  updateUser: (user: User) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser(),
  token: localStorage.getItem(apiTokenStorageKey),
  authenticate: async (email, password) => {
    const result = await api.post<AuthResponse>("/auth/login", { email, password });
    const user = toAppUser(result.user);
    localStorage.setItem(apiTokenStorageKey, result.token);
    localStorage.setItem("buildpulse.user", JSON.stringify(user));
    set({ user, token: result.token });
    return user;
  },
  register: async (input) => {
    const result = await api.post<AuthResponse>("/auth/register", input);
    const user = toAppUser(result.user);
    localStorage.setItem(apiTokenStorageKey, result.token);
    localStorage.setItem("buildpulse.user", JSON.stringify(user));
    set({ user, token: result.token });
    return user;
  },
  updateUser: (user) => set({ user }),
  signOut: () => {
    localStorage.removeItem(apiTokenStorageKey);
    localStorage.removeItem("buildpulse.user");
    set({ user: null, token: null });
  },
}));
