const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";
const DEFAULT_TIMEOUT_MS = 10_000;

type ApiClientOptions = RequestInit & {
  isMultipart?: boolean;
  timeoutMs?: number;
};

/**
 * A wrapper around the native fetch API that automatically handles base URL prepending,
 * JSON content-type headers, timeout aborting, and authorization token injection.
 * 
 * @param endpoint - The API endpoint to call (appended to BASE_URL).
 * @param options - Fetch options including custom headers, body, timeout, and multipart flags.
 * @returns A promise resolving to the JSON parsed response payload.
 */
export const apiClient = async (endpoint: string, options: ApiClientOptions = {}) => {
  const normalizedBase = BASE_URL.replace(/\/+$/, "");
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${normalizedBase}${normalizedEndpoint}`;
  const headers = new Headers(options.headers);
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const { timeoutMs = DEFAULT_TIMEOUT_MS, isMultipart, ...fetchOptions } = options;

  if (!isMultipart && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const controller = new AbortController();
  const externalSignal = options.signal;
  let didTimeout = false;
  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort(externalSignal.reason);
    } else {
      externalSignal.addEventListener("abort", () => controller.abort(), { once: true });
    }
  }

  const timeoutId = setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, timeoutMs);

  let response: Response;

  try {
    response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal
    });
  } catch (error) {
    if (didTimeout) {
      throw new Error("Request timed out. Please try again.", { cause: error });
    }

    throw new Error("Unable to reach the server. Check that the API is running.", { cause: error });
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
