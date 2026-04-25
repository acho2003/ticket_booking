import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeModules, Platform } from "react-native";

const TOKEN_KEY = "bhutan_mobile_token";

function getMetroHost() {
  const scriptURL = NativeModules.SourceCode?.scriptURL;

  if (!scriptURL) {
    return null;
  }

  try {
    return new URL(scriptURL).hostname;
  } catch {
    const match = scriptURL.match(/https?:\/\/([^/:]+)/);
    return match?.[1] ?? null;
  }
}

function resolveApiUrl() {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5000";

  if (Platform.OS === "web") {
    return configuredUrl;
  }

  try {
    const parsedUrl = new URL(configuredUrl);
    const isLocalhost =
      parsedUrl.hostname === "localhost" ||
      parsedUrl.hostname === "127.0.0.1" ||
      parsedUrl.hostname === "0.0.0.0";

    if (!isLocalhost) {
      return configuredUrl;
    }

    const metroHost = getMetroHost();

    if (!metroHost) {
      return configuredUrl;
    }

    parsedUrl.hostname = metroHost;
    return parsedUrl.toString().replace(/\/$/, "");
  } catch {
    return configuredUrl;
  }
}

const API_URL = resolveApiUrl();

export async function mobileApiFetch<T>(
  path: string,
  options: { method?: string; body?: unknown; token?: string | null } = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? "Request failed");
  }

  return payload.data as T;
}

export const authStorage = {
  getToken: () => AsyncStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => AsyncStorage.setItem(TOKEN_KEY, token),
  clearToken: () => AsyncStorage.removeItem(TOKEN_KEY)
};
