// Full Railway URL — used for OAuth navigation (window.location.href) and server-side fetches
const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://med-delivery-system-be-production.up.railway.app';

// Both browser and server-side fetches hit the backend directly
const API_BASE = BASE_URL;

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refresh_token');
}

function setTokens(access: string, refresh?: string): void {
  localStorage.setItem('auth_token', access);
  if (refresh) localStorage.setItem('refresh_token', refresh);
}

function clearTokens(): void {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_role');
  localStorage.removeItem('user_name');
  localStorage.removeItem('pharmacy_id');
  localStorage.removeItem('user_info');
}

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null): void {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  pendingQueue = [];
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('Please sign in to continue.');

  let res: Response;
  try {
    res = await fetch(
      `${API_BASE}/api/auth/refresh?refreshToken=${encodeURIComponent(refreshToken)}`,
      { method: 'POST', redirect: 'manual' }
    );
  } catch {
    throw new Error('Could not reach the server. Please check your connection.');
  }

  // 401 = proxy converted a 302 redirect; non-ok = bad refresh token
  if (!res.ok || res.type === 'opaqueredirect') {
    clearTokens();
    throw new Error('Your session has expired. Please sign in again.');
  }

  const data = await res.json();
  const newToken = data.data?.accessToken ?? data.accessToken;
  const newRefresh = data.data?.refreshToken ?? data.refreshToken;
  setTokens(newToken, newRefresh);
  return newToken;
}

export type ApiClientOptions = RequestInit & { skipAuth?: boolean; timeoutMs?: number };

async function fetchWithTimeout(
  input: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(input, { ...init, signal: controller.signal }).finally(() =>
    clearTimeout(id)
  );
}

export async function apiClient<T = unknown>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const { skipAuth = false, timeoutMs = 30000, ...fetchOptions } = options;
  const url = `${API_BASE}${endpoint}`;
  const isFormData = fetchOptions.body instanceof FormData;

  const buildHeaders = (token: string | null): HeadersInit => {
    const base: Record<string, string> = isFormData ? {} : { 'Content-Type': 'application/json' };
    if (token && !skipAuth) base['Authorization'] = `Bearer ${token}`;
    return { ...base, ...(fetchOptions.headers as Record<string, string>) };
  };

  const doRequest = (token: string | null) =>
    fetchWithTimeout(url, { ...fetchOptions, headers: buildHeaders(token), redirect: 'manual' }, timeoutMs);

  let token = getToken();
  let res: Response;
  try {
    res = await doRequest(token);
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('The server is taking too long to respond. It may be starting up — please wait a moment and try again.');
    }
    throw new Error('Could not reach the server. Please check your connection and try again.');
  }

  // Detect auth failures: 401 (from proxy's 302→401 conversion), classic 401, or raw 302 redirect
  const isAuthRedirect = res.type === 'opaqueredirect' || (res.status >= 301 && res.status <= 303);

  if ((res.status === 401 || isAuthRedirect) && !skipAuth) {
    if (isRefreshing) {
      const newToken = await new Promise<string>((resolve, reject) =>
        pendingQueue.push({ resolve, reject })
      );
      res = await doRequest(newToken);
    } else {
      isRefreshing = true;
      try {
        token = await refreshAccessToken();
        processQueue(null, token);
        res = await doRequest(token);
      } catch (err) {
        processQueue(err, null);
        throw err;
      } finally {
        isRefreshing = false;
      }
    }
  }

  if (!res.ok) {
    if (res.type === 'opaqueredirect' || res.status === 0) {
      clearTokens();
      throw new Error('Your session has expired. Please sign in again.');
    }
    let message = `Request failed (${res.status})`;
    try {
      const err = await res.json();
      console.error('[apiClient] error body:', JSON.stringify(err, null, 2));

      // Field errors nested in err.data (our backend's validation shape)
      const dataErrors =
        err.data && typeof err.data === 'object' && !Array.isArray(err.data)
          ? Object.entries(err.data as Record<string, string>)
              .map(([k, v]) => `${k}: ${v}`)
              .join('; ')
          : null;

      // Top-level err.errors array or object
      const fieldErrors = err.errors
        ? Array.isArray(err.errors)
          ? (err.errors as string[]).join(', ')
          : Object.values(err.errors as Record<string, unknown>).flat().join(', ')
        : null;

      message = dataErrors
        ? `Validation failed — ${dataErrors}`
        : err.message ?? err.detail ?? err.error ?? err.title ?? fieldErrors ?? message;
    } catch {
      // non-JSON error body
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export { setTokens, clearTokens, getToken, getRefreshToken, BASE_URL };
