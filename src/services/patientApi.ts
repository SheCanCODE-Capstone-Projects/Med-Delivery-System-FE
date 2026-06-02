import { apiClient, BASE_URL } from './apiClient';
import type {
  ApiResponse,
  PagedResponse,
  OrderResponse,
  CreateOrderRequest,
  PaymentResponse,
  PrescriptionResponse,
  PatientProfileResponse,
  PatientProfileRequest,
  InsuranceCardResponse,
  PatientLocationResponse,
  PatientLocationRequest,
  MedicineRequestResponse,
  MedicineRequestRequest,
  SubstitutionResponse,
  ChatbotResponse,
  ChatbotRequest,
} from '@/types/api';

function toAbsoluteUrl(url?: string): string | undefined {
  if (!url) return url;
  return url.startsWith('/') ? `${BASE_URL}${url}` : url;
}

function normalizeProfile(p: PatientProfileResponse): PatientProfileResponse {
  return { ...p, profileImageUrl: toAbsoluteUrl(p.profileImageUrl) };
}

function normalizeInsuranceCard(c: InsuranceCardResponse): InsuranceCardResponse {
  return { ...c, frontImageUrl: toAbsoluteUrl(c.frontImageUrl), backImageUrl: toAbsoluteUrl(c.backImageUrl) };
}

interface InsuranceCardRequest {
  providerName: string;
  memberId: string;
  frontImageUrl?: string;
  backImageUrl?: string;
}

interface InsuranceCardUpdateRequest {
  providerName?: string;
  memberId?: string;
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function createOrder(data: CreateOrderRequest): Promise<OrderResponse> {
  const res = await apiClient<ApiResponse<OrderResponse>>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function getMyOrders(
  page = 0,
  size = 10
): Promise<PagedResponse<OrderResponse>> {
  const res = await apiClient<ApiResponse<PagedResponse<OrderResponse>>>(
    `/api/orders/my-orders?page=${page}&size=${size}`
  );
  return res.data;
}

export async function getOrderDetails(id: number): Promise<OrderResponse> {
  const res = await apiClient<ApiResponse<OrderResponse>>(`/api/orders/${id}`);
  return res.data;
}

export async function confirmPayment(id: number): Promise<OrderResponse> {
  const res = await apiClient<ApiResponse<OrderResponse>>(`/api/orders/${id}/pay`, {
    method: 'POST',
  });
  return res.data;
}

export async function getPaymentDetails(id: number): Promise<PaymentResponse> {
  const res = await apiClient<ApiResponse<PaymentResponse>>(`/api/orders/${id}/payment`);
  return res.data;
}

// ─── Prescriptions ────────────────────────────────────────────────────────────

export async function uploadPrescription(
  file: File,
  options?: {
    notes?: string;
    prescriptionDate?: string;
    hasStamp?: boolean;
    hasSignature?: boolean;
  }
): Promise<PrescriptionResponse> {
  const form = new FormData();
  form.append('file', file);
  if (options?.notes) form.append('notes', options.notes);
  if (options?.prescriptionDate) form.append('prescriptionDate', options.prescriptionDate);
  if (options?.hasStamp !== undefined) form.append('hasStamp', String(options.hasStamp));
  if (options?.hasSignature !== undefined)
    form.append('hasSignature', String(options.hasSignature));

  const res = await apiClient<ApiResponse<PrescriptionResponse>>(
    '/api/patient/prescriptions',
    { method: 'POST', body: form }
  );
  return res.data;
}

export async function getMyPrescriptions(): Promise<PrescriptionResponse[]> {
  const res = await apiClient<ApiResponse<PrescriptionResponse[]>>(
    '/api/patient/prescriptions'
  );
  return res.data;
}

export async function getPrescriptionById(id: number): Promise<PrescriptionResponse> {
  const res = await apiClient<ApiResponse<PrescriptionResponse>>(
    `/api/patient/prescriptions/${id}`
  );
  return res.data;
}

export async function deletePrescription(id: number): Promise<void> {
  await apiClient<ApiResponse<string>>(`/api/patient/prescriptions/${id}`, {
    method: 'DELETE',
  });
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function getMyProfile(): Promise<PatientProfileResponse> {
  const res = await apiClient<ApiResponse<PatientProfileResponse>>('/api/patient/profile');
  return normalizeProfile(res.data);
}

export async function updateProfile(
  data: PatientProfileRequest
): Promise<PatientProfileResponse> {
  const res = await apiClient<ApiResponse<PatientProfileResponse>>('/api/patient/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return normalizeProfile(res.data);
}

export async function uploadProfileImage(file: File): Promise<PatientProfileResponse> {
  const form = new FormData();
  form.append('file', file);
  const res = await apiClient<ApiResponse<PatientProfileResponse>>(
    '/api/patient/profile/image',
    { method: 'POST', body: form }
  );
  return normalizeProfile(res.data);
}

// ─── Insurance Cards ──────────────────────────────────────────────────────────

export async function addInsuranceCard(
  data: InsuranceCardRequest
): Promise<InsuranceCardResponse> {
  const res = await apiClient<ApiResponse<InsuranceCardResponse>>(
    '/api/patient/profile/insurance',
    { method: 'POST', body: JSON.stringify(data) }
  );
  return normalizeInsuranceCard(res.data);
}

export async function getMyInsuranceCards(): Promise<InsuranceCardResponse[]> {
  const res = await apiClient<ApiResponse<InsuranceCardResponse[]>>(
    '/api/patient/profile/insurance'
  );
  return res.data.map(normalizeInsuranceCard);
}

export async function getInsuranceCardById(id: number): Promise<InsuranceCardResponse> {
  const res = await apiClient<ApiResponse<InsuranceCardResponse>>(
    `/api/patient/profile/insurance/${id}`
  );
  return normalizeInsuranceCard(res.data);
}

export async function updateInsuranceCard(
  id: number,
  data: InsuranceCardUpdateRequest
): Promise<InsuranceCardResponse> {
  const res = await apiClient<ApiResponse<InsuranceCardResponse>>(
    `/api/patient/profile/insurance/${id}`,
    { method: 'PUT', body: JSON.stringify(data) }
  );
  return normalizeInsuranceCard(res.data);
}

export async function deleteInsuranceCard(id: number): Promise<void> {
  await apiClient<ApiResponse<string>>(`/api/patient/profile/insurance/${id}`, {
    method: 'DELETE',
  });
}

export async function uploadInsuranceCard(
  frontImage: File,
  backImage: File,
  providerName: string,
  memberId: string
): Promise<InsuranceCardResponse> {
  const form = new FormData();
  form.append('frontImage', frontImage);
  form.append('backImage', backImage);
  form.append('providerName', providerName);
  form.append('memberId', memberId);
  const res = await apiClient<ApiResponse<InsuranceCardResponse>>(
    '/api/patient/profile/insurance/upload',
    { method: 'POST', body: form }
  );
  return normalizeInsuranceCard(res.data);
}

// ─── Locations ────────────────────────────────────────────────────────────────

export async function addLocation(
  data: PatientLocationRequest
): Promise<PatientLocationResponse> {
  const res = await apiClient<ApiResponse<PatientLocationResponse>>(
    '/api/patient/locations',
    { method: 'POST', body: JSON.stringify(data) }
  );
  return res.data;
}

export async function getAllLocations(): Promise<PatientLocationResponse[]> {
  const res = await apiClient<ApiResponse<PatientLocationResponse[]>>(
    '/api/patient/locations'
  );
  return res.data;
}

export async function getLocation(id: number): Promise<PatientLocationResponse> {
  const res = await apiClient<ApiResponse<PatientLocationResponse>>(
    `/api/patient/locations/${id}`
  );
  return res.data;
}

export async function updateLocation(
  id: number,
  data: PatientLocationRequest
): Promise<PatientLocationResponse> {
  const res = await apiClient<ApiResponse<PatientLocationResponse>>(
    `/api/patient/locations/${id}`,
    { method: 'PUT', body: JSON.stringify(data) }
  );
  return res.data;
}

export async function deleteLocation(id: number): Promise<void> {
  await apiClient<ApiResponse<string>>(`/api/patient/locations/${id}`, {
    method: 'DELETE',
  });
}

export async function setDefaultLocation(id: number): Promise<void> {
  await apiClient<ApiResponse<string>>(`/api/patient/locations/${id}/set-default`, {
    method: 'POST',
  });
}

// ─── Medicine Requests ────────────────────────────────────────────────────────

export async function submitMedicineRequest(
  data: MedicineRequestRequest
): Promise<MedicineRequestResponse> {
  const res = await apiClient<ApiResponse<MedicineRequestResponse>>(
    '/api/patient/medicine-requests',
    { method: 'POST', body: JSON.stringify(data) }
  );
  return res.data;
}

export async function getMyMedicineRequests(): Promise<MedicineRequestResponse[]> {
  const res = await apiClient<ApiResponse<MedicineRequestResponse[]>>(
    '/api/patient/medicine-requests'
  );
  return res.data;
}

export async function getMedicineRequest(id: number): Promise<MedicineRequestResponse> {
  const res = await apiClient<ApiResponse<MedicineRequestResponse>>(
    `/api/patient/medicine-requests/${id}`
  );
  return res.data;
}

export async function confirmMedicineRequest(id: number): Promise<MedicineRequestResponse> {
  const res = await apiClient<ApiResponse<MedicineRequestResponse>>(
    `/api/patient/medicine-requests/${id}/confirm`,
    { method: 'POST' }
  );
  return res.data;
}

export async function cancelMedicineRequest(id: number): Promise<MedicineRequestResponse> {
  const res = await apiClient<ApiResponse<MedicineRequestResponse>>(
    `/api/patient/medicine-requests/${id}/cancel`,
    { method: 'POST' }
  );
  return res.data;
}

// ─── Substitutions ────────────────────────────────────────────────────────────

export async function getPendingSubstitutions(): Promise<SubstitutionResponse[]> {
  const res = await apiClient<ApiResponse<SubstitutionResponse[]>>(
    '/api/substitutions/pending'
  );
  return res.data;
}

export async function approveSubstitution(substitutionId: number): Promise<SubstitutionResponse> {
  const res = await apiClient<ApiResponse<SubstitutionResponse>>(
    `/api/substitutions/${substitutionId}/approve`,
    { method: 'PUT' }
  );
  return res.data;
}

export async function rejectSubstitution(
  substitutionId: number,
  reason: string
): Promise<SubstitutionResponse> {
  const res = await apiClient<ApiResponse<SubstitutionResponse>>(
    `/api/substitutions/${substitutionId}/reject?reason=${encodeURIComponent(reason)}`,
    { method: 'PUT' }
  );
  return res.data;
}

// ─── Medicine Search ──────────────────────────────────────────────────────────

export async function searchMedicines(q: string, limit = 10): Promise<string[]> {
  const res = await apiClient<ApiResponse<string[]>>(
    `/api/medicines/search?q=${encodeURIComponent(q)}&limit=${limit}`
  );
  return res.data;
}

// ─── Chatbot ──────────────────────────────────────────────────────────────────

export async function askChatbot(
  request: ChatbotRequest,
  conversationId?: string
): Promise<ChatbotResponse> {
  const headers: Record<string, string> = {};
  if (conversationId) headers['X-Conversation-Id'] = conversationId;
  const res = await apiClient<ApiResponse<ChatbotResponse>>('/api/chatbot/ask', {
    method: 'POST',
    body: JSON.stringify(request),
    headers,
  });
  return res.data;
}

// Legacy exports kept for backward compatibility
export type PatientProfilePayload = PatientProfileRequest;
export const patientApi = {
  getProfile: getMyProfile,
  getPrescriptions: getMyPrescriptions,
  getMyOrders,
  getPendingSubstitutions,
  searchMedicines,
};
