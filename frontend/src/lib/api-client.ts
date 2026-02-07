const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function getAuthToken(): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/get-session`, {
      credentials: "include",
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data?.session?.token || null;
  } catch {
    return null;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/sign-in?expired=true";
    }
    throw new ApiError(401, "Your session has expired. Please sign in again.");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.error || "Something went wrong");
  }

  return data as T;
}

export const api = {
  tasks: {
    list: () => apiClient<import("@/types/task").Task[]>("/api/tasks"),
    get: (id: string) => apiClient<import("@/types/task").Task>(`/api/tasks/${id}`),
    create: (payload: import("@/types/task").CreateTaskPayload) =>
      apiClient<import("@/types/task").Task>("/api/tasks", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: import("@/types/task").UpdateTaskPayload) =>
      apiClient<import("@/types/task").Task>(`/api/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    delete: (id: string) =>
      apiClient<void>(`/api/tasks/${id}`, {
        method: "DELETE",
      }),
  },
};
