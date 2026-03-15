/**
 * API client for ClearScan backend.
 * Extend with your backend base URL and endpoints.
 */

const getBaseUrl = (): string => {
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) {
    return (import.meta.env.VITE_API_URL as string).replace(/\/$/, "");
  }
  return "";
};

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const base = getBaseUrl();
  const url = path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export default { api };
