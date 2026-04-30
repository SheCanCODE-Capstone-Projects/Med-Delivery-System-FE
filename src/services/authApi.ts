import { apiClient } from "./apiClient";

type LoginCredentials = {
  username: string;
  password: string;
  role: string;
};

type OtpPayload = {
  phone: string;
  role?: string;
  otp?: string;
};

const useMockAuth = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true";

const otpStore = new Map<string, { code: string; expiresAt: number }>();

const roleNameMap: Record<string, string> = {
  patient: "PATIENT",
  pharmacist: "PHARMACIST",
  pharmacy: "PHARMACY_ADMIN",
  "super-admin": "SUPER_ADMIN"
};

const createDemoOtp = () => `${Math.floor(100000 + Math.random() * 900000)}`;

export const requestLoginOtp = async ({ phone, role }: OtpPayload) => {
  if (!useMockAuth) {
    return apiClient("/auth/login/request-otp", {
      method: "POST",
      body: JSON.stringify({ phone, role })
    });
  }

  const code = createDemoOtp();
  otpStore.set(phone, {
    code,
    expiresAt: Date.now() + 5 * 60 * 1000
  });

  return {
    success: true,
    demoOtp: code
  };
};

export const verifyLoginOtp = async ({ phone, otp }: OtpPayload) => {
  if (!useMockAuth) {
    return apiClient("/auth/login/verify-otp", {
      method: "POST",
      body: JSON.stringify({ phone, otp })
    });
  }

  const record = otpStore.get(phone);

  if (!record) {
    throw new Error("No active OTP was found for this phone number.");
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(phone);
    throw new Error("This OTP has expired. Request a new code.");
  }

  if (record.code !== otp) {
    throw new Error("The OTP code is incorrect.");
  }

  otpStore.delete(phone);
  return { success: true };
};

export const login = async (credentials: LoginCredentials) => {
  if (!useMockAuth) {
    return apiClient("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials)
    });
  }

  return {
    token: "mock-jwt-token",
    user: {
      role: roleNameMap[credentials.role] ?? "PATIENT",
      roleKey: credentials.role
    }
  };
};

export const registerPatient = async (data) => {
  return { success: true };
};

export const registerPharmacy = async (data) => {
  return { success: true, pharmacyId: "PH-123" };
};
