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

function isPrivateOrLocalHost(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname === "::1" ||
    /^10\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  );
}

function resolveApiUrl() {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5000";

  if (Platform.OS === "web") {
    return configuredUrl.replace(/\/$/, "");
  }

  try {
    const parsedUrl = new URL(configuredUrl);
    const metroHost = getMetroHost();

    if (!metroHost || !isPrivateOrLocalHost(parsedUrl.hostname)) {
      return configuredUrl.replace(/\/$/, "");
    }

    parsedUrl.hostname = metroHost;
    return parsedUrl.toString().replace(/\/$/, "");
  } catch {
    return configuredUrl.replace(/\/$/, "");
  }
}

export const API_URL = resolveApiUrl();

export async function mobileApiFetch<T>(
  path: string,
  options: { method?: string; body?: unknown; token?: string | null } = {}
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network request failed";
    throw new Error(`Could not reach Movi API at ${API_URL}. ${message}`);
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? "Request failed");
  }

  return payload.data as T;
}

export function resolveMobileAssetUrl(path: string | null | undefined) {
  if (!path) {
    return "";
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export const authStorage = {
  getToken: () => AsyncStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => AsyncStorage.setItem(TOKEN_KEY, token),
  clearToken: () => AsyncStorage.removeItem(TOKEN_KEY)
};
