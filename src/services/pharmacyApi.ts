import { apiClient, getToken } from './apiClient';
import type {
  ApiResponse,
  PharmacyResponse,
  PharmacyRegistrationRequest,
  ManagerUpdateRequest,
  PharmacistResponse,
  AddPharmacistRequest,
  PharmacyInventoryResponse,
  PharmacyInventoryRequest,
  OrderResponse,
  PatientProfileResponse,
  InsuranceCardResponse,
  InsuranceProvider,
} from '@/types/api';

export async function getInsuranceProviders(): Promise<InsuranceProvider[]> {
  const res = await apiClient<ApiResponse<InsuranceProvider[]>>('/api/insurance-providers');
  return res.data ?? [];
}

// ─── Pharmacy CRUD ────────────────────────────────────────────────────────────

export async function registerPharmacy(
  data: PharmacyRegistrationRequest
): Promise<PharmacyResponse> {
  const res = await apiClient<PharmacyResponse>('/api/pharmacies/register', {
    method: 'POST',
    body: JSON.stringify(data),
    skipAuth: true,
  });
  return res;
}

export async function getMyPharmacy(): Promise<PharmacyResponse> {
  return apiClient<PharmacyResponse>('/api/pharmacies/me');
}

export async function getAllPharmacies(status?: string): Promise<PharmacyResponse[]> {
  const url = status ? `/api/pharmacies?status=${status}` : '/api/pharmacies';
  return apiClient<PharmacyResponse[]>(url);
}

export async function getActivePharmacies(): Promise<PharmacyResponse[]> {
  return apiClient<PharmacyResponse[]>('/api/pharmacies/active');
}

export async function getPharmacy(id: number): Promise<PharmacyResponse> {
  return apiClient<PharmacyResponse>(`/api/pharmacies/${id}`);
}

export async function updatePharmacyStatus(
  id: number,
  status: string
): Promise<PharmacyResponse> {
  return apiClient<PharmacyResponse>(`/api/pharmacies/${id}/status?status=${status}`, {
    method: 'PATCH',
  });
}

export async function transferManager(data: ManagerUpdateRequest): Promise<PharmacyResponse> {
  return apiClient<PharmacyResponse>('/api/pharmacies/transfer-manager', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── Pharmacists ──────────────────────────────────────────────────────────────

export async function addPharmacist(
  pharmacyId: number,
  data: AddPharmacistRequest
): Promise<PharmacistResponse> {
  return apiClient<PharmacistResponse>(`/api/pharmacies/${pharmacyId}/pharmacists`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getPharmacistsByPharmacy(
  pharmacyId: number
): Promise<PharmacistResponse[]> {
  return apiClient<PharmacistResponse[]>(`/api/pharmacies/${pharmacyId}/pharmacists`);
}

export async function getPharmacist(
  pharmacyId: number,
  id: number
): Promise<PharmacistResponse> {
  return apiClient<PharmacistResponse>(`/api/pharmacies/${pharmacyId}/pharmacists/${id}`);
}

export async function removePharmacist(pharmacyId: number, id: number): Promise<void> {
  await apiClient<void>(`/api/pharmacies/${pharmacyId}/pharmacists/${id}`, {
    method: 'DELETE',
  });
}

export async function getMyPharmacyOrders(
  pharmacyId: number
): Promise<OrderResponse[]> {
  return apiClient<OrderResponse[]>(
    `/api/pharmacies/${pharmacyId}/orders`
  );
}

export async function updatePharmacistOrderStatus(
  pharmacyId: number,
  orderId: number,
  status: string
): Promise<OrderResponse> {
  return apiClient<OrderResponse>(
    `/api/pharmacies/${pharmacyId}/pharmacists/orders/${orderId}/status?status=${status}`,
    { method: 'PUT' }
  );
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export async function getInventory(
  pharmacyId: number
): Promise<PharmacyInventoryResponse[]> {
  const res = await apiClient<ApiResponse<PharmacyInventoryResponse[]>>(
    `/api/pharmacies/${pharmacyId}/inventory`
  );
  return res.data;
}

export async function addInventoryItem(
  pharmacyId: number,
  data: PharmacyInventoryRequest
): Promise<PharmacyInventoryResponse> {
  const res = await apiClient<ApiResponse<PharmacyInventoryResponse>>(
    `/api/pharmacies/${pharmacyId}/inventory`,
    { method: 'POST', body: JSON.stringify(data) }
  );
  return res.data;
}

export async function deleteInventoryItem(
  pharmacyId: number,
  itemId: number
): Promise<void> {
  await apiClient<ApiResponse<string>>(
    `/api/pharmacies/${pharmacyId}/inventory/${itemId}`,
    { method: 'DELETE' }
  );
}

// ─── Patients ─────────────────────────────────────────────────────────────────

export async function getPharmacyPatients(
  pharmacyId: number
): Promise<PatientProfileResponse[]> {
  const res = await apiClient<ApiResponse<PatientProfileResponse[]>>(
    `/api/pharmacies/${pharmacyId}/patients`
  );
  return res.data;
}

// ─── Insurance (PHARMACIST / MANAGER) ─────────────────────────────────────────

export async function getInsuranceCard(
  insuranceCardId: number
): Promise<InsuranceCardResponse> {
  const res = await apiClient<ApiResponse<InsuranceCardResponse>>(
    `/api/insurance/${insuranceCardId}`
  );
  return res.data;
}

export async function verifyInsurance(
  insuranceCardId: number,
  pharmacyId: number,
  approved: boolean,
  notes?: string
): Promise<void> {
  const params = new URLSearchParams({
    pharmacyId: String(pharmacyId),
    approved: String(approved),
  });
  if (notes) params.set('notes', notes);
  await apiClient<ApiResponse<void>>(`/api/insurance/${insuranceCardId}/verify?${params}`, {
    method: 'PUT',
  });
}

export async function markInsurancePending(insuranceCardId: number): Promise<void> {
  await apiClient<ApiResponse<void>>(`/api/insurance/${insuranceCardId}/pending`, {
    method: 'PUT',
  });
}

// ─── Pharmacy Insurance Providers ─────────────────────────────────────────────

export async function getPharmacyInsuranceProviders(pharmacyId: number): Promise<InsuranceProvider[]> {
  const res = await apiClient<InsuranceProvider[] | ApiResponse<InsuranceProvider[]>>(
    `/api/pharmacies/${pharmacyId}/insurance-providers`
  );
  if (Array.isArray(res)) return res;
  return (res as ApiResponse<InsuranceProvider[]>).data ?? [];
}

export async function addPharmacyInsuranceProvider(pharmacyId: number, providerId: number): Promise<void> {
  const res = await fetch(`/api/pharmacies/${pharmacyId}/insurance-providers/${providerId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken() ?? ''}` },
  });
  if (!res.ok) throw new Error(`Failed to add provider (${res.status})`);
}

export async function removePharmacyInsuranceProvider(pharmacyId: number, providerId: number): Promise<void> {
  const res = await fetch(`/api/pharmacies/${pharmacyId}/insurance-providers/${providerId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken() ?? ''}` },
  });
  if (!res.ok) throw new Error(`Failed to remove provider (${res.status})`);
}

// ─── Update Pharmacy Profile ──────────────────────────────────────────────────

export async function updateMyPharmacy(data: { contactInfo?: string; address?: string }): Promise<PharmacyResponse> {
  const res = await apiClient<ApiResponse<PharmacyResponse>>('/api/pharmacies/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return (res as ApiResponse<PharmacyResponse>).data ?? (res as unknown as PharmacyResponse);
}
