import { apiClient } from './apiClient';

export interface LoginEvent {
  id: number;
  userId?: number;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  failureReason?: string;
  timestamp: string;
}

export interface SuspiciousActivity {
  ipAddress: string;
  failedAttempts: number;
}

export interface SecurityStats {
  totalLogins24h: number;
  failedAttempts24h: number;
  successfulLogins24h: number;
  successRate: number;
}

export async function getLoginHistory(page = 0, size = 20): Promise<{ content: LoginEvent[]; totalElements: number }> {
  const r = await apiClient<{ data: { content: LoginEvent[]; totalElements: number } }>(
    `/api/admin/security/login-history?page=${page}&size=${size}`
  );
  return r.data;
}

export async function getSuspiciousActivity(): Promise<SuspiciousActivity[]> {
  const r = await apiClient<{ data: SuspiciousActivity[] }>('/api/admin/security/suspicious');
  return r.data;
}

export async function getSecurityStats(): Promise<SecurityStats> {
  const r = await apiClient<{ data: SecurityStats }>('/api/admin/security/stats');
  return r.data;
}

export async function forceLogout(userId: number): Promise<void> {
  await apiClient(`/api/admin/security/force-logout/${userId}`, { method: 'POST' });
}
