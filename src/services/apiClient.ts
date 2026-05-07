const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

type ApiClientOptions = RequestInit & {
  isMultipart?: boolean;
};

export const apiClient = async (endpoint: string, options: ApiClientOptions = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers);
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  if (!options.isMultipart && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message ?? `API Error: ${response.status}`);
  }

  return payload;
};
