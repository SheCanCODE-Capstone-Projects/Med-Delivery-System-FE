import { apiClient } from './apiClient';
import type {
  ApiResponse,
  PagedResponse,
  DashboardStatsResponse,
  AdminUserResponse,
  AdminUserSearchRequest,
  UserStatusUpdateRequest,
  PharmacyApprovalDetailResponse,
  PharmacyApprovalRequest,
  ManagerUpdateRequest,
  AdminOrderResponse,
  OrderInterventionRequest,
  AnalyticsReportResponse,
  AuditLogResponse,
  InsuranceProvider,
  PaymentResponse,
  InsuranceCardResponse,
} from '@/types/api';

export async function getDashboardStats(): Promise<DashboardStatsResponse> {
  const res = await apiClient<unknown>('/api/admin/dashboard/stats');
  const typed = res as ApiResponse<DashboardStatsResponse>;
  if (typed?.data && typeof typed.data === 'object') return typed.data;
  return res as DashboardStatsResponse;
}

export async function searchUsers(
  request: AdminUserSearchRequest
): Promise<PagedResponse<AdminUserResponse>> {
  const res = await apiClient<ApiResponse<PagedResponse<AdminUserResponse>>>(
    '/api/admin/users/search',
    { method: 'POST', body: JSON.stringify(request) }
  );
  return res.data;
}

export async function updateUserStatus(
  id: number,
  request: UserStatusUpdateRequest
): Promise<void> {
  await apiClient<ApiResponse<void>>(`/api/admin/users/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(request),
  });
}

export async function getPharmacyForApproval(
  id: number
): Promise<PharmacyApprovalDetailResponse> {
  const res = await apiClient<ApiResponse<PharmacyApprovalDetailResponse>>(
    `/api/admin/pharmacies/pending/${id}`
  );
  return res.data;
}

export async function approvePharmacy(
  id: number,
  request: PharmacyApprovalRequest
): Promise<void> {
  await apiClient<ApiResponse<void>>(`/api/admin/pharmacies/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function suspendPharmacy(id: number, reason: string): Promise<void> {
  await apiClient<ApiResponse<void>>(
    `/api/admin/pharmacies/${id}/suspend?reason=${encodeURIComponent(reason)}`,
    { method: 'POST' }
  );
}

export async function replacePharmacyManager(
  id: number,
  request: ManagerUpdateRequest
): Promise<void> {
  await apiClient<ApiResponse<void>>(`/api/admin/pharmacies/${id}/manager`, {
    method: 'PUT',
    body: JSON.stringify(request),
  });
}

export async function getAllInsuranceProviders(): Promise<InsuranceProvider[]> {
  const res = await apiClient<ApiResponse<InsuranceProvider[]>>('/api/admin/insurance-providers');
  return res.data;
}

export interface InsuranceProviderRequest {
  name: string;
  code: string;
  coveragePercentage: number;
}

export async function createInsuranceProvider(data: InsuranceProviderRequest): Promise<InsuranceProvider> {
  const res = await apiClient<ApiResponse<InsuranceProvider>>('/api/admin/insurance-providers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updateInsuranceProvider(id: number, data: InsuranceProviderRequest): Promise<InsuranceProvider> {
  const res = await apiClient<ApiResponse<InsuranceProvider>>(`/api/admin/insurance-providers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function deleteInsuranceProvider(id: number): Promise<void> {
  await apiClient<ApiResponse<void>>(`/api/admin/insurance-providers/${id}`, { method: 'DELETE' });
}

export async function getGlobalOrders(
  page = 0,
  size = 20,
  status?: string
): Promise<PagedResponse<AdminOrderResponse>> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (status) params.set('status', status);
  const res = await apiClient<ApiResponse<PagedResponse<AdminOrderResponse>>>(
    `/api/admin/orders?${params}`
  );
  return res.data;
}

export async function forceCancelOrder(
  id: number,
  request: OrderInterventionRequest
): Promise<void> {
  await apiClient<ApiResponse<void>>(`/api/admin/orders/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function reassignOrder(
  id: number,
  request: OrderInterventionRequest
): Promise<void> {
  await apiClient<ApiResponse<void>>(`/api/admin/orders/${id}/reassign`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function overrideSubstitution(
  id: number,
  request: OrderInterventionRequest
): Promise<void> {
  await apiClient<ApiResponse<void>>(`/api/admin/substitutions/${id}/override`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function getLowStockAlerts(threshold = 5): Promise<unknown[]> {
  const res = await apiClient<ApiResponse<unknown[]>>(
    `/api/admin/inventory/low-stock?threshold=${threshold}`
  );
  return res.data;
}

export async function getAuditLogs(): Promise<AuditLogResponse[]> {
  const res = await apiClient<unknown>('/api/admin/audit-logs');
  const typed = res as ApiResponse<AuditLogResponse[]>;
  if (Array.isArray(typed?.data)) return typed.data;
  if (Array.isArray(res)) return res as AuditLogResponse[];
  return [];
}

export async function getAnalyticsReport(
  period = 'MONTHLY'
): Promise<AnalyticsReportResponse> {
  const res = await apiClient<ApiResponse<AnalyticsReportResponse>>(
    `/api/admin/reports/analytics?period=${period}`
  );
  return res.data;
}

export async function getInsuranceClaims(
  page = 0,
  size = 10,
  status?: string
): Promise<PagedResponse<PaymentResponse>> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (status) params.set('status', status);
  const res = await apiClient<ApiResponse<PagedResponse<PaymentResponse>>>(
    `/api/admin/insurance-claims?${params}`
  );
  return res.data;
}

export async function processInsuranceClaim(
  id: number,
  action: 'APPROVE' | 'REJECT'
): Promise<PaymentResponse> {
  const res = await apiClient<ApiResponse<PaymentResponse>>(
    `/api/admin/insurance-claims/${id}/process?action=${action}`,
    { method: 'POST' }
  );
  return res.data;
}

export async function getAllAdminInsuranceCards(status?: string): Promise<InsuranceCardResponse[]> {
  const params = status ? `?status=${encodeURIComponent(status)}` : '';
  const res = await apiClient<ApiResponse<InsuranceCardResponse[]>>(
    `/api/admin/insurance-cards${params}`
  );
  return res.data;
}

export async function verifyInsuranceCard(
  id: number,
  coveragePercentage: number
): Promise<InsuranceCardResponse> {
  const res = await apiClient<ApiResponse<InsuranceCardResponse>>(
    `/api/admin/insurance-cards/${id}/verify?coveragePercentage=${coveragePercentage}`,
    { method: 'POST' }
  );
  return res.data;
}

export async function rejectInsuranceCard(
  id: number,
  notes?: string
): Promise<InsuranceCardResponse> {
  const params = notes ? `?notes=${encodeURIComponent(notes)}` : '';
  const res = await apiClient<ApiResponse<InsuranceCardResponse>>(
    `/api/admin/insurance-cards/${id}/reject${params}`,
    { method: 'POST' }
  );
  return res.data;
}

export async function getAdminProfile(): Promise<AdminUserResponse> {
  const res = await apiClient<ApiResponse<AdminUserResponse>>('/api/admin/me');
  return res.data;
}

export async function updateAdminProfile(
  data: { fullName?: string; phoneNumber?: string }
): Promise<AdminUserResponse> {
  const res = await apiClient<ApiResponse<AdminUserResponse>>('/api/admin/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.data;
}
