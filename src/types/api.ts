// ─── Shared ───────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  role: string;
  userId: number;
  pharmacyId?: number;
  fullName?: string;
  email?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email?: string;
  phoneNumber?: string;
  password: string;
}

export interface OtpVerifyRequest {
  username: string;
  otp: string;
}

export interface SetPasswordRequest {
  username: string;
  otp: string;
  password: string;
  fullName?: string;
  phoneNumber?: string;
}

export interface ForgotPasswordRequest {
  username: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface DashboardStatsResponse {
  totalPharmacies: number;
  pendingApprovals: number;
  totalPatients: number;
  totalOrders: number;
  activePharmacists: number;
  totalRevenue?: number;
  ordersToday?: number;
  lowStockAlerts?: number;
}

export interface AdminUserResponse {
  id: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminUserSearchRequest {
  query?: string;
  role?: string;
  status?: string;
  page?: number;
  size?: number;
}

export interface UserStatusUpdateRequest {
  isActive: boolean;
}

export interface PharmacyApprovalDetailResponse {
  id: number;
  name: string;
  licenseNumber: string;
  address: string;
  ownerName: string;
  email: string;
  phoneNumber: string;
  status: string;
  registeredAt: string;
  documents?: string[];
}

export interface PharmacyApprovalRequest {
  action: 'APPROVE' | 'REJECT';
  reason?: string;
}

export interface ManagerUpdateRequest {
  managerEmail: string;
  managerName: string;
  managerPhone?: string;
}

export interface AdminOrderResponse {
  id: number;
  patientName: string;
  pharmacyName: string;
  status: string;
  totalAmount?: number;
  createdAt: string;
  medicines?: string[];
}

export interface OrderInterventionRequest {
  reason: string;
  newPharmacyId?: number;
  substitutionAction?: string;
}

export interface AnalyticsReportResponse {
  period: string;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  newPatients: number;
  activePharmacies: number;
}

export interface AuditLogResponse {
  id: number;
  action: string;
  performedBy: string;
  targetId?: number;
  targetType?: string;
  details?: string;
  createdAt: string;
}

export interface InsuranceProvider {
  id: number;
  name: string;
  code: string;
  coveragePercentage: number;
}

export interface PaymentResponse {
  id: number;
  orderId: number;
  patientName?: string;
  totalAmount: number;
  insuranceAmount: number;
  patientAmount: number;
  status: string;
  paymentMethod?: string;
  transactionId?: string;
  insuranceProvider?: string;
  failureReason?: string;
  createdAt: string;
  paidAt?: string;
}

export interface InsuranceCardResponse {
  id: number;
  patientName?: string;
  providerName: string;
  memberId: string;
  frontImageUrl?: string;
  backImageUrl?: string;
  coveragePercentage?: number;
  verified?: boolean;
  status: string;
  createdAt: string;
}

// ─── Pharmacy ─────────────────────────────────────────────────────────────────

export interface PharmacyResponse {
  id: number;
  name: string;
  pharmacyCode?: string;
  licenseNumber: string;
  contactInfo?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  status: string;
  managerName?: string;
  managerEmail?: string;
  supportedInsurances?: string[];
  createdAt: string;
}

export interface PharmacyRegistrationRequest {
  name: string;
  pharmacyCode: string;
  licenseNumber: string;
  address: string;
  phoneNumber: string;
  contactInfo: string;
  managerName: string;
  managerEmail: string;
  managerPassword: string;
  insuranceProviderIds: number[];
  latitude?: number;
  longitude?: number;
}

export interface PharmacistResponse {
  id: number;
  pharmacistUniqueId?: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  pharmacyId?: number;
  pharmacyName?: string;
  branchId?: number;
  branchName?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}

export interface AddPharmacistRequest {
  fullName: string;
  email: string;
  phoneNumber?: string;
}

export interface PharmacyInventoryResponse {
  id: number;
  medicineName: string;
  quantity: number;
  unit: string;
  price: number;
  expiryDate?: string;
  lowStockThreshold?: number;
}

export interface PharmacyInventoryRequest {
  medicineName: string;
  quantity: number;
  unit: string;
  price: number;
  expiryDate?: string;
  lowStockThreshold?: number;
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export interface OrderResponse {
  id: number;
  patientName: string;
  pharmacyName?: string;
  branchId?: number;
  branchName?: string;
  status: string;
  orderType?: string;
  fulfillmentType?: string;
  deliveryAddress?: string;
  totalAmount?: number;
  patientPayableAmount?: number;
  insurancePayableAmount?: number;
  coveragePercentage?: number;
  paymentStatus?: string;
  paymentMethod?: string;
  notes?: string;
  prescriptionUrl?: string;
  items?: OrderItemResponse[];
  createdAt: string;
}

export interface OrderItemResponse {
  id: number;
  medicineId: number;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  status?: string;
  inStock?: boolean;
}

export interface CreateOrderRequest {
  orderType: 'PRESCRIPTION_BASED' | 'PRIVATE_PURCHASE';
  fulfillmentType?: 'DELIVERY' | 'PICKUP';
  prescriptionId?: number;
  insuranceCardId?: number;
  items: Array<{ medicineName?: string; medicineId?: number; quantity: number }>;
  deliveryAddress?: string;
  notes?: string;
}

// ─── Prescription ─────────────────────────────────────────────────────────────

export interface PrescriptionResponse {
  id: number;
  fileUrl: string;
  fileType: string;
  notes?: string;
  prescriptionDate?: string;
  hasStamp: boolean;
  hasSignature: boolean;
  status: string;
  createdAt: string;
}

// ─── Patient Profile ──────────────────────────────────────────────────────────

export interface PatientProfileResponse {
  id: number;
  userId?: number;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  allergies?: string;
  medicalNotes?: string;
  hasLocation?: boolean;
  hasInsurance?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface PatientProfileRequest {
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  allergies?: string;
  medicalNotes?: string;
}

export interface PatientLocationResponse {
  id: number;
  label?: string;
  manualAddress?: string;
  latitude?: number;
  longitude?: number;
  inputType?: 'GPS' | 'MANUAL';
  isDefault: boolean;
  updatedAt?: string;
}

export interface PatientLocationRequest {
  manualAddress: string;
  label?: string;
  inputType: 'GPS' | 'MANUAL';
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

// ─── Medicine Request ─────────────────────────────────────────────────────────

export interface MedicineRequestResponse {
  id: number;
  medicineName: string;
  quantity: number;
  notes?: string;
  status: string;
  createdAt: string;
}

export interface MedicineRequestRequest {
  medicineName: string;
  quantity: number;
  orderType: 'PRIVATE_PURCHASE' | 'PRESCRIPTION_BASED';
  fulfillmentType: 'DELIVERY' | 'PICKUP';
  notes?: string;
}

// ─── Dispensing ───────────────────────────────────────────────────────────────

export interface DispensingOrderResponse {
  id: number;
  branchId?: number;
  branchName?: string;
  patientName: string;
  patientEmail?: string;
  status: string;
  prescriptionUrl?: string;
  prescriptionNotes?: string;
  medicines?: OrderItemResponse[];
  validationStatus?: string;
  stockConfirmed?: boolean;
  createdAt: string;
  updatedAt?: string;
  // Patient medical info
  patientAllergies?: string;
  patientBloodType?: string;
  patientMedicalNotes?: string;
  orderType?: string;
  // Prescription auto-check data
  prescriptionDate?: string;
  hasStamp?: boolean;
  hasSignature?: boolean;
  // Pharmacist delivery instructions
  medicationNotes?: string;
}

export interface SubstitutionResponse {
  id: number;
  orderId: number;
  originalMedicineId?: number;
  originalMedicineName: string;
  substituteMedicineId?: number;
  substituteMedicineName: string;
  pharmacistReason?: string;
  patientReason?: string;
  status: string;
  requestedAt: string;
  respondedAt?: string;
}

export interface ActionLogResponse {
  id: number;
  action: string;
  performedBy: string;
  notes?: string;
  createdAt: string;
}

// ─── Chatbot ──────────────────────────────────────────────────────────────────

export interface ChatbotRequest {
  message: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ChatbotResponse {
  reply: string;
  conversationId: string;
  tokenUsage?: number;
  model?: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

// ─── Inventory (batch-based) ──────────────────────────────────────────────────

export interface MedicineResponse {
  id: number;
  name: string;
  genericName?: string;
  category?: string;
  unit?: string;
  sellingPrice?: number;
  lowStockAlert?: number;
  requiresPrescription: boolean;
  description?: string;
  createdAt?: string;
  totalQuantity: number;
  batchCount: number;
  earliestExpiry?: string;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRING_SOON';
}

export interface StockEntryResponse {
  id: number;
  medicineId: number;
  medicineName: string;
  branchId: number;
  branchName: string;
  batchNumber?: string;
  quantityReceived: number;
  purchasePrice?: number;
  supplier?: string;
  manufacturingDate?: string;
  expiryDate?: string;
  notes?: string;
  createdAt: string;
  status: 'ACTIVE' | 'EXPIRED' | 'EXPIRING_SOON';
}

export interface InventoryDashboardStats {
  totalMedicines: number;
  totalStockUnits: number;
  lowStockItems: number;
  expiringSoonItems: number;
}

export interface MedicineFormRequest {
  medicineName: string;
  genericName?: string;
  category?: string;
  unit?: string;
  sellingPrice?: number;
  lowStockAlert?: number;
  requiresPrescription?: boolean;
  description?: string;
}

export interface StockEntryRequest {
  medicineId?: number;
  batchNumber?: string;
  quantityReceived: number;
  purchasePrice?: number;
  supplier?: string;
  manufacturingDate?: string;
  expiryDate?: string;
  notes?: string;
}
