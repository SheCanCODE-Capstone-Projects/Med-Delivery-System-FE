import { apiClient, setTokens, clearTokens } from './apiClient';
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  OtpVerifyRequest,
  SetPasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '@/types/api';

function normalizeRole(role: string): string {
  return role?.replace(/^ROLE_/, '') ?? '';
}

export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  const res = await apiClient<Record<string, unknown>>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
    skipAuth: true,
  });

  // Unwrap { data: {...} } or use the response directly
  const raw = (res?.data && typeof res.data === 'object')
    ? (res.data as Record<string, unknown>)
    : (res as Record<string, unknown>);

  const accessToken = (raw.accessToken ?? raw.token ?? '') as string;
  const refreshToken = (raw.refreshToken ?? '') as string;
  const role = normalizeRole((raw.role ?? '') as string);
  const fullName = (raw.fullName ?? raw.name ?? '') as string;
  const pharmacyId = raw.pharmacyId as number | undefined;
  const userId = (raw.userId ?? raw.id ?? 0) as number;

  if (!accessToken) throw new Error('Login response missing access token.');
  if (!role) throw new Error('Login response missing role.');

  setTokens(accessToken, refreshToken);
  localStorage.setItem('user_role', role);
  if (fullName) localStorage.setItem('user_name', fullName);
  if (pharmacyId) localStorage.setItem('pharmacy_id', String(pharmacyId));

  return { accessToken, refreshToken, tokenType: 'Bearer', role, userId, fullName, pharmacyId };
}

export async function registerPatient(data: RegisterRequest): Promise<string> {
  const res = await apiClient<ApiResponse<string>>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
    skipAuth: true,
  });
  return res.message;
}

export async function sendOtp(username: string): Promise<string> {
  const res = await apiClient<ApiResponse<string>>(
    `/api/auth/send-otp?username=${encodeURIComponent(username)}`,
    { method: 'POST', skipAuth: true, timeoutMs: 60000 }
  );
  return res.message;
}

export async function verifyOtp(data: OtpVerifyRequest): Promise<AuthResponse> {
  const res = await apiClient<ApiResponse<Record<string, unknown>>>('/api/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify(data),
    skipAuth: true,
    timeoutMs: 60000,
  });
  const raw = res.data as Record<string, unknown>;
  const accessToken = (raw.accessToken ?? raw.token ?? '') as string;
  const refreshToken = (raw.refreshToken ?? '') as string;
  const role = normalizeRole((raw.role ?? '') as string);
  const fullName = (raw.fullName ?? '') as string;
  const pharmacyId = raw.pharmacyId as number | undefined;
  const userId = (raw.userId ?? 0) as number;

  if (!accessToken) throw new Error('Verification response missing access token.');

  setTokens(accessToken, refreshToken);
  localStorage.setItem('user_role', role);
  if (fullName) localStorage.setItem('user_name', fullName);
  if (pharmacyId) localStorage.setItem('pharmacy_id', String(pharmacyId));
  return { accessToken, refreshToken, tokenType: 'Bearer', role, userId, fullName, pharmacyId };
}

export async function setPassword(data: SetPasswordRequest): Promise<AuthResponse> {
  const res = await apiClient<ApiResponse<Record<string, unknown>>>('/api/auth/set-password', {
    method: 'POST',
    body: JSON.stringify(data),
    skipAuth: true,
    timeoutMs: 60000,
  });
  const raw = res.data as Record<string, unknown>;
  const accessToken = (raw.accessToken ?? raw.token ?? '') as string;
  const refreshToken = (raw.refreshToken ?? '') as string;
  const role = normalizeRole((raw.role ?? '') as string);
  const fullName = (raw.fullName ?? '') as string;
  const pharmacyId = raw.pharmacyId as number | undefined;
  const userId = (raw.userId ?? 0) as number;
  setTokens(accessToken, refreshToken);
  localStorage.setItem('user_role', role);
  if (fullName) localStorage.setItem('user_name', fullName);
  if (pharmacyId) localStorage.setItem('pharmacy_id', String(pharmacyId));
  return { accessToken, refreshToken, tokenType: 'Bearer', role, userId, fullName, pharmacyId };
}

export async function forgotPassword(data: ForgotPasswordRequest): Promise<void> {
  await apiClient<ApiResponse<string>>('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(data),
    skipAuth: true,
  });
}

export async function resetPassword(data: ResetPasswordRequest): Promise<AuthResponse> {
  const res = await apiClient<ApiResponse<Record<string, unknown>>>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(data),
    skipAuth: true,
  });
  const raw = res.data as Record<string, unknown>;
  const accessToken = (raw.accessToken ?? raw.token ?? '') as string;
  const refreshToken = (raw.refreshToken ?? '') as string;
  const role = normalizeRole((raw.role ?? '') as string);
  const fullName = (raw.fullName ?? '') as string;
  const pharmacyId = raw.pharmacyId as number | undefined;
  const userId = (raw.userId ?? 0) as number;
  setTokens(accessToken, refreshToken);
  localStorage.setItem('user_role', role);
  if (fullName) localStorage.setItem('user_name', fullName);
  return { accessToken, refreshToken, tokenType: 'Bearer', role, userId, fullName, pharmacyId };
}

export async function firebasePhoneLogin(firebaseToken: string): Promise<AuthResponse> {
  const res = await apiClient<ApiResponse<AuthResponse>>(
    `/api/auth/firebase-phone-login?firebaseToken=${encodeURIComponent(firebaseToken)}`,
    { method: 'POST', skipAuth: true, timeoutMs: 30000 }
  );
  const auth = res.data;
  const role = normalizeRole(auth.role);
  setTokens(auth.accessToken, auth.refreshToken);
  localStorage.setItem('user_role', role);
  if (auth.fullName) localStorage.setItem('user_name', auth.fullName);
  if (auth.pharmacyId) localStorage.setItem('pharmacy_id', String(auth.pharmacyId));
  return { ...auth, role };
}

export async function logout(): Promise<void> {
  const refreshToken = localStorage.getItem('refresh_token') ?? '';
  // Clear tokens immediately — UI redirects without waiting for the network
  clearTokens();
  // Fire backend logout in background to invalidate the refresh token
  apiClient<ApiResponse<string>>(
    `/api/auth/logout?refreshToken=${encodeURIComponent(refreshToken)}`,
    { method: 'POST' }
  ).catch(() => {});
}

export function getUserRole(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('user_role');
}

export function getUserName(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('user_name');
}

export function getPharmacyId(): number | null {
  if (typeof window === 'undefined') return null;
  const id = localStorage.getItem('pharmacy_id');
  return id ? Number(id) : null;
}

export function roleToRoute(role: string): string {
  const map: Record<string, string> = {
    SUPER_ADMIN: '/super-admin/analytics',
    MANAGER: '/Pharmacy-admin',
    PHARMACIST: '/pharmacist',
    PATIENT: '/patient-dashboard',
  };
  return map[normalizeRole(role)] ?? '/auth/login';
}
