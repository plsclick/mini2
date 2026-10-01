export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function fakeDelay<T>(data: T, ms = 120): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, ms));
  return data;
}

const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:5000/api").replace(/\/$/, "");
export const apiServerUrl = API_URL.replace(/\/api$/, "");
const TOKEN_KEY = "buildpulse.token";

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path.startsWith("/") ? path : `/${path}`}`, {
      ...init,
      headers,
    });
  } catch {
    throw new ApiError(0, "Could not connect to the BUILD//PULSE API");
  }

  if (response.status === 204) return undefined as T;
  const envelope = await response.json().catch(() => null) as ApiEnvelope<T> | null;
  if (!response.ok || !envelope?.success) {
    throw new ApiError(response.status, envelope?.error?.message ?? "The API request failed");
  }
  return envelope.data as T;
}

export const api = {
  async get<T>(path: string): Promise<T> {
    return request<T>(path);
  },

  async post<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, { method: "POST", body: JSON.stringify(body) });
  },

  async put<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, { method: "PUT", body: JSON.stringify(body) });
  },

  async delete(path: string): Promise<void> {
    return request<void>(path, { method: "DELETE" });
  },
};

export const apiTokenStorageKey = TOKEN_KEY;
