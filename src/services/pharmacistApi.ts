import { apiClient } from './apiClient';
import type {
  ApiResponse,
  DispensingOrderResponse,
  SubstitutionResponse,
  ActionLogResponse,
} from '@/types/api';

interface ValidatePrescriptionRequest {
  valid?: boolean;
  notes?: string;
}

interface SuggestSubstitutionRequest {
  originalMedicineName: string;
  substituteMedicineName: string;
  reason: string;
}

interface DispenseMedicineRequest {
  notes?: string;
}

export async function getAssignedOrders(): Promise<DispensingOrderResponse[]> {
  const res = await apiClient<ApiResponse<DispensingOrderResponse[]>>(
    '/api/pharmacist/dispensing/orders'
  );
  return res.data;
}

export async function getOrderDetail(orderId: number): Promise<DispensingOrderResponse> {
  const res = await apiClient<ApiResponse<DispensingOrderResponse>>(
    `/api/pharmacist/dispensing/orders/${orderId}`
  );
  return res.data;
}

export async function validatePrescription(
  orderId: number,
  request?: ValidatePrescriptionRequest
): Promise<DispensingOrderResponse> {
  const res = await apiClient<ApiResponse<DispensingOrderResponse>>(
    `/api/pharmacist/dispensing/orders/${orderId}/validate`,
    { method: 'POST', body: JSON.stringify(request ?? {}) }
  );
  return res.data;
}

export async function confirmStock(orderId: number): Promise<DispensingOrderResponse> {
  const res = await apiClient<ApiResponse<DispensingOrderResponse>>(
    `/api/pharmacist/dispensing/orders/${orderId}/stock`,
    { method: 'POST' }
  );
  return res.data;
}

export async function suggestSubstitution(
  orderId: number,
  request: SuggestSubstitutionRequest
): Promise<SubstitutionResponse> {
  const res = await apiClient<ApiResponse<SubstitutionResponse>>(
    `/api/pharmacist/dispensing/orders/${orderId}/substitution`,
    { method: 'POST', body: JSON.stringify(request) }
  );
  return res.data;
}

export async function dispenseMedicine(
  orderId: number,
  request?: DispenseMedicineRequest
): Promise<DispensingOrderResponse> {
  const res = await apiClient<ApiResponse<DispensingOrderResponse>>(
    `/api/pharmacist/dispensing/orders/${orderId}/dispense`,
    { method: 'POST', body: JSON.stringify(request ?? {}) }
  );
  return res.data;
}

export async function getActionLogs(orderId: number): Promise<ActionLogResponse[]> {
  const res = await apiClient<ApiResponse<ActionLogResponse[]>>(
    `/api/pharmacist/dispensing/orders/${orderId}/logs`
  );
  return res.data;
}
