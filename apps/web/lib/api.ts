const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

type FetchOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
  cache?: RequestCache;
};

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: options.cache ?? "no-store"
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? "Request failed");
  }

  return payload.data as T;
}

export const getStoredToken = () =>
  typeof window === "undefined" ? null : window.localStorage.getItem("bhutan_movie_token");

export const setStoredToken = (token: string) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("bhutan_movie_token", token);
  }
};

export const clearStoredToken = () => {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("bhutan_movie_token");
  }
};
