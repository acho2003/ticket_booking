const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export const getAdminToken = () =>
  typeof window === "undefined" ? null : window.localStorage.getItem("bhutan_admin_token");

export const setAdminToken = (token: string) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("bhutan_admin_token", token);
  }
};

export const clearAdminToken = () => {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("bhutan_admin_token");
  }
};

export async function adminApiFetch<T>(
  path: string,
  options: { method?: string; body?: unknown; token?: string | null } = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store"
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? "Request failed");
  }

  return payload.data as T;
}
