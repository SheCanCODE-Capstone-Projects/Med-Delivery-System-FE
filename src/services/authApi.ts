import { apiClient } from "./apiClient";

type LoginCredentials = {
  username: string;
  password: string;
  role?: string;
};

type OtpPayload = {
  phone: string;
  role?: string;
  otp?: string;
};

export type PatientRegistrationData = Record<string, unknown>;
export type PharmacyRegistrationData = Record<string, unknown>;

type LoginResponse = {
  token?: string;
  refreshToken?: string;
  user?: {
    id?: number;
    fullName?: string;
    email?: string;
    role?: string;
    roleKey?: string;
  };
};

const useMockAuth = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true";

const otpStore = new Map<string, { code: string; expiresAt: number }>();

const roleNameMap: Record<string, string> = {
  patient: "PATIENT",
  pharmacist: "PHARMACIST",
  pharmacy: "PHARMACY_ADMIN",
  "super-admin": "SUPER_ADMIN"
};

const roleKeyMap: Record<string, string> = {
  PATIENT: "patient",
  PHARMACIST: "pharmacist",
  MANAGER: "pharmacy",
  PHARMACY_ADMIN: "pharmacy",
  SUPER_ADMIN: "super-admin"
};

/**
 * Generates a demo OTP code for mock authentication flows.
 */
const createDemoOtp = () => `${Math.floor(100000 + Math.random() * 900000)}`;

/**
 * Requests a login OTP from the API or mock store for the provided phone number.
 */
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

/**
 * Verifies a submitted OTP against the API or the in-memory mock store.
 */
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

/**
 * Authenticates a user with the login API and falls back to mock auth when enabled.
 */
export const login = async (credentials: LoginCredentials) => {
  if (!useMockAuth) {
    const response = await apiClient("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: credentials.username,
        password: credentials.password
      })
    }) as LoginResponse;

    return {
      ...response,
      user: response.user
        ? {
            ...response.user,
            roleKey: roleKeyMap[response.user.role ?? ""] ?? "patient"
          }
        : undefined
    };
  }

  return {
    token: "mock-jwt-token",
    user: {
      role: roleNameMap[credentials.role ?? "patient"] ?? "PATIENT",
      roleKey: credentials.role ?? "patient"
    }
  };
};

/**
 * Placeholder patient registration helper until the real API flow is connected.
 */
export const registerPatient = async (data: PatientRegistrationData) => {
  return { success: true };
};

/**
 * Placeholder pharmacy registration helper until the real API flow is connected.
 */
export const registerPharmacy = async (data: PharmacyRegistrationData) => {
  return { success: true, pharmacyId: "PH-123" };
};
