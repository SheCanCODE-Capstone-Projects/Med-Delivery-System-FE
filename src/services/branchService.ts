import { apiClient } from './apiClient';
import type {
  MedicineResponse,
  StockEntryResponse,
  InventoryDashboardStats,
  MedicineFormRequest,
  StockEntryRequest,
} from '@/types/api';

export interface BranchResponse {
  id: number;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  contactInfo?: string;
  status: string;
  pharmacyId: number;
  pharmacyName: string;
  managerName?: string;
  managerEmail?: string;
  pharmacistCount: number;
  inventoryItemCount: number;
  createdAt: string;
}

export interface BranchStatsResponse {
  branchId: number;
  branchName: string;
  pharmacistCount: number;
  inventoryItems: number;
  lowStockItems: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
}

export interface BranchPharmacistResponse {
  id: number;
  pharmacistUniqueId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  pharmacyId: number;
  pharmacyName: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}

export interface BranchInventoryItem {
  id: number;
  medicineId: number;
  medicineName: string;
  genericName?: string;
  quantity: number;
  price: number;
  unit?: string;
  dosageInstructions?: string;
  lowStockThreshold?: number;
  expiryDate?: string;
  lastUpdated?: string;
}

export async function getBranchDashboard(): Promise<BranchStatsResponse> {
  const r = await apiClient<{ data: BranchStatsResponse }>('/api/branch-manager/dashboard');
  return r.data;
}

export async function getMyBranch(): Promise<BranchResponse> {
  const r = await apiClient<{ data: BranchResponse }>('/api/branch-manager/branch');
  return r.data;
}

export async function getBranchPharmacists(): Promise<BranchPharmacistResponse[]> {
  const r = await apiClient<{ data: BranchPharmacistResponse[] }>('/api/branch-manager/pharmacists');
  return r.data;
}

export async function addBranchPharmacist(form: { fullName: string; email: string; phoneNumber?: string }): Promise<BranchPharmacistResponse> {
  const r = await apiClient<{ data: BranchPharmacistResponse }>('/api/branch-manager/pharmacists', {
    method: 'POST',
    body: JSON.stringify(form),
  });
  return r.data;
}

export async function deactivateBranchPharmacist(id: number): Promise<void> {
  await apiClient(`/api/branch-manager/pharmacists/${id}/deactivate`, { method: 'PUT' });
}

// ── Inventory (batch-based) ────────────────────────────────────────────────────

export async function getInventoryStats(): Promise<InventoryDashboardStats> {
  const r = await apiClient<{ data: InventoryDashboardStats }>('/api/branch-manager/inventory/stats');
  return r.data;
}

export async function getMedicines(): Promise<MedicineResponse[]> {
  const r = await apiClient<{ data: MedicineResponse[] }>('/api/branch-manager/medicines');
  return r.data;
}

export async function createMedicine(form: MedicineFormRequest): Promise<MedicineResponse> {
  const r = await apiClient<{ data: MedicineResponse }>('/api/branch-manager/medicines', {
    method: 'POST',
    body: JSON.stringify(form),
  });
  return r.data;
}

export async function getMedicineDetail(id: number): Promise<MedicineResponse> {
  const r = await apiClient<{ data: MedicineResponse }>(`/api/branch-manager/medicines/${id}`);
  return r.data;
}

export async function updateMedicine(id: number, form: MedicineFormRequest): Promise<MedicineResponse> {
  const r = await apiClient<{ data: MedicineResponse }>(`/api/branch-manager/medicines/${id}`, {
    method: 'PUT',
    body: JSON.stringify(form),
  });
  return r.data;
}

export async function deleteMedicine(id: number): Promise<void> {
  await apiClient(`/api/branch-manager/medicines/${id}`, { method: 'DELETE' });
}

export async function getStockEntries(medicineId: number): Promise<StockEntryResponse[]> {
  const r = await apiClient<{ data: StockEntryResponse[] }>(`/api/branch-manager/medicines/${medicineId}/stock`);
  return r.data;
}

export async function addStockEntry(medicineId: number, form: StockEntryRequest): Promise<StockEntryResponse> {
  const r = await apiClient<{ data: StockEntryResponse }>(`/api/branch-manager/medicines/${medicineId}/stock`, {
    method: 'POST',
    body: JSON.stringify(form),
  });
  return r.data;
}

export async function getBranchReport(): Promise<BranchStatsResponse> {
  const r = await apiClient<{ data: BranchStatsResponse }>('/api/branch-manager/reports');
  return r.data;
}

export async function getPharmacyBranches(): Promise<BranchResponse[]> {
  const r = await apiClient<{ data: BranchResponse[] }>('/api/pharmacy/branches');
  return r.data;
}

export async function getBranchDetails(id: number): Promise<BranchResponse> {
  const r = await apiClient<{ data: BranchResponse }>(`/api/pharmacy/branches/${id}`);
  return r.data;
}

export async function suspendBranch(id: number): Promise<void> {
  await apiClient(`/api/pharmacy/branches/${id}/suspend`, { method: 'POST' });
}

export async function inviteBranchManager(email: string, branchName: string, branchAddress?: string): Promise<void> {
  await apiClient('/api/pharmacy/branches/invite', {
    method: 'POST',
    body: JSON.stringify({ email, branchName, branchAddress }),
  });
}
