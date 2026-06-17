import { apiClient } from './apiClient';
import type { ApiResponse } from '@/types/api';

// ── Shared report types ───────────────────────────────────────────────────────

/** A single point in a "last 6 months" analytics series. `value` = order count or revenue amount. */
export interface MonthlyPoint {
  month: string;   // short label, e.g. "Jan"
  value: number;
}

/** Analytics fields shared by every comprehensive report (last 6 months). */
export interface ReportAnalytics {
  ordersByMonth?: MonthlyPoint[];
  revenueByMonth?: MonthlyPoint[];
  ordersByStatus?: Record<string, number>;
}

export interface SuperAdminReport {
  generatedBy: string;
  generatedDate: string;
  reportPeriod?: string;
  totalPharmacies: number;
  totalBranches: number;
  totalUsers: number;
  totalPatients: number;
  totalOrders: number;
  totalRevenue: number;
  pharmacyPerformance: { pharmacyName: string; branches: number; staff: number; orders: number; revenue: number }[];
  userStatsByRole: Record<string, number>;
  recentAuditActivities: { userEmail: string; action: string; ipAddress: string; timestamp: string }[];
}

export interface PharmacyAdminReport extends ReportAnalytics {
  pharmacyName: string;
  reportPeriod: string;
  generatedBy: string;
  generatedDate: string;
  totalBranches: number;
  totalStaff: number;
  totalInventoryItems: number;
  totalRevenue: number;
  totalOrders: number;
  branchPerformance: { branchName: string; orders: number; pharmacists: number; inventoryItems: number; status: string }[];
  staffSummary: { employeeName: string; email: string; role: string; branch: string; active: boolean }[];
  inventorySummary: { medicineName: string; totalStock: number; unit: string; price: number }[];
  lowStockMedicines: { medicineName: string; currentStock: number; reorderLevel: number; branch: string }[];
}

export interface BranchManagerReport extends ReportAnalytics {
  branchName: string;
  managerName: string;
  reportPeriod: string;
  generatedDate: string;
  revenue: number;
  totalOrders: number;
  prescriptionOrders: number;
  pharmacistCount: number;
  patientsServed: number;
  delivered: number;
  pending: number;
  cancelled: number;
  salesReport: { medicineName: string; qtySold: number; revenue: number }[];
  prescriptions: { orderId: number; patientName: string; status: string; date: string }[];
  inventoryReport: { medicineName: string; availableStock: number; unit: string; lowStock: boolean }[];
  staffActivities: { pharmacistName: string; pharmacistId: string; ordersHandled: number; active: boolean }[];
}

export interface PharmacistReport extends ReportAnalytics {
  pharmacistName: string;
  pharmacistId: string;
  branch: string;
  pharmacyName: string;
  reportDate: string;
  generatedDate: string;
  reportPeriod?: string;
  prescriptionsReviewed: number;
  prescriptionsApproved: number;
  prescriptionsRejected: number;
  medicinesDispensed: number;
  processedPrescriptions: { orderId: number; patientName: string; status: string; date: string; validationStatus: string }[];
  dispensedMedicines: { medicineName: string; totalQuantity: number }[];
  rejectedPrescriptions: { orderId: number; patientName: string; reason: string; date: string }[];
}

export interface PatientReport extends ReportAnalytics {
  patientName: string;
  patientId: number;
  reportDate: string;
  generatedDate: string;
  reportPeriod?: string;
  totalOrders: number;
  totalPrescriptions: number;
  totalAmountSpent: number;
  orderHistory: { orderId: number; date: string; status: string; orderType: string; amount: number; medicationNotes: string }[];
  prescriptionHistory: { prescriptionId: number; uploadDate: string; status: string; validationStatus: string }[];
  purchasedMedicines: { medicineName: string; quantity: number; orderId: string; date: string }[];
  deliveryHistory: { orderId: number; status: string; fulfillmentType: string; date: string }[];
}

// ── API calls ─────────────────────────────────────────────────────────────────

export async function getSuperAdminReport(period = 'ALL_TIME'): Promise<SuperAdminReport> {
  const res = await apiClient<ApiResponse<SuperAdminReport>>(`/api/admin/reports/comprehensive?period=${period}`);
  return res.data;
}

export async function getPharmacyAdminReport(period = 'ALL_TIME'): Promise<PharmacyAdminReport> {
  const res = await apiClient<ApiResponse<PharmacyAdminReport>>(`/api/pharmacy/branches/reports/comprehensive?period=${period}`);
  return res.data;
}

export async function getBranchManagerReport(period = 'ALL_TIME'): Promise<BranchManagerReport> {
  const res = await apiClient<ApiResponse<BranchManagerReport>>(`/api/branch-manager/reports/comprehensive?period=${period}`);
  return res.data;
}

export async function getPharmacistReport(period = 'ALL_TIME'): Promise<PharmacistReport> {
  const res = await apiClient<ApiResponse<PharmacistReport>>(`/api/pharmacist/dispensing/reports/comprehensive?period=${period}`);
  return res.data;
}

export async function getPatientReport(period = 'ALL_TIME'): Promise<PatientReport> {
  const res = await apiClient<ApiResponse<PatientReport>>(`/api/patient/reports/comprehensive?period=${period}`);
  return res.data;
}
