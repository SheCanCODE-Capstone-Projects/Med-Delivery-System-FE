import { apiClient } from "./apiClient";

function patientRequest<T>(endpoint: string, options: Parameters<typeof apiClient>[1] = {}) {
  return apiClient(endpoint, options) as Promise<T>;
}

export type PatientProfilePayload = {
  fullName: string;
  phoneNumber: string;
  profileImageUrl?: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  dateOfBirth?: string;
  gender?: string;
  allergies?: string;
  medicalNotes?: string;
};

export type InsuranceCardPayload = {
  providerName: string;
  memberId: string;
  frontImageUrl: string;
  backImageUrl: string;
  coveragePercentage?: number;
};

export type OrderItemPayload = {
  medicineId: number;
  quantity: number;
};

export type CreateOrderPayload = {
  orderType: "PRESCRIPTION_BASED" | "PRIVATE_PURCHASE";
  fulfillmentType: "DELIVERY" | "PICKUP";
  deliveryAddress?: string;
  prescriptionId?: number;
  insuranceCardId?: number;
  items: OrderItemPayload[];
};

/**
 * A collection of API methods for patient-specific operations such as
 * fetching profiles, insurance cards, prescriptions, managing orders,
 * and interacting with the AI chatbot.
 */
export const patientApi = {
  getProfile: () => patientRequest("/patient/profile"),
  updateProfile: (profile: PatientProfilePayload) =>
    patientRequest("/patient/profile", {
      method: "PUT",
      body: JSON.stringify(profile)
    }),
  getInsuranceCards: () => patientRequest("/patient/profile/insurance"),
  addInsuranceCard: (card: InsuranceCardPayload) =>
    patientRequest("/patient/profile/insurance", {
      method: "POST",
      body: JSON.stringify(card)
    }),
  getPrescriptions: () => patientRequest("/patient/prescriptions"),
  uploadPrescription: (formData: FormData) =>
    patientRequest("/patient/prescriptions", {
      method: "POST",
      body: formData,
      isMultipart: true
    }),
  searchMedicines: (query: string, limit = 10) =>
    patientRequest(`/medicines/search?q=${encodeURIComponent(query)}&limit=${limit}`),
  createOrder: (order: CreateOrderPayload) =>
    patientRequest("/orders", {
      method: "POST",
      body: JSON.stringify(order)
    }),
  getMyOrders: (page = 0, size = 10) => patientRequest(`/orders/my-orders?page=${page}&size=${size}`),
  getOrder: (id: number) => patientRequest(`/orders/${id}`),
  confirmPayment: (id: number) =>
    patientRequest(`/orders/${id}/pay`, {
      method: "POST"
    }),
  getPayment: (id: number) => patientRequest(`/orders/${id}/payment`),
  getPendingSubstitutions: () => patientRequest("/substitutions/pending"),
  approveSubstitution: (substitutionId: number, patientId: number) =>
    patientRequest(`/substitutions/${substitutionId}/approve?patientId=${patientId}`, {
      method: "PUT"
    }),
  rejectSubstitution: (substitutionId: number, reason: string) =>
    patientRequest(`/substitutions/${substitutionId}/reject`, {
      method: "PUT",
      body: JSON.stringify({ reason })
    }),
  askChatbot: (message: string, conversationId?: string) =>
    patientRequest("/chatbot/ask", {
      method: "POST",
      headers: conversationId ? { "X-Conversation-Id": conversationId } : undefined,
      body: JSON.stringify({
        message,
        maxTokens: 150,
        temperature: 0.7
      })
    })
};
