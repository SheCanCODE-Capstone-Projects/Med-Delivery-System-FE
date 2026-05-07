const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";
const DEFAULT_TIMEOUT_MS = 10_000;

type ApiClientOptions = RequestInit & {
  isMultipart?: boolean;
  timeoutMs?: number;
};

export const apiClient = async (endpoint: string, options: ApiClientOptions = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers);
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const { timeoutMs = DEFAULT_TIMEOUT_MS, isMultipart, ...fetchOptions } = options;

  if (!isMultipart && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const controller = options.signal ? null : new AbortController();
  let didTimeout = false;
  const timeoutId = controller
    ? setTimeout(() => {
        didTimeout = true;
        controller.abort();
      }, timeoutMs)
    : null;

  let response: Response;

  try {
    response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: options.signal ?? controller?.signal
    });
  } catch (error) {
    if (didTimeout) {
      throw new Error("Request timed out. Please try again.");
    }

    throw error;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message ?? `API Error: ${response.status}`);
  }

  return payload;
};
