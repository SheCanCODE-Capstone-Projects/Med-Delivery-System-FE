// Mock implementations for now until API is ready

export const login = async (_credentials) => {
  // return apiClient('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
  return { token: 'mock-jwt-token', user: { role: 'PATIENT' } };
};

export const registerPatient = async (_data) => {
  return { success: true };
};

export const registerPharmacy = async (_data) => {
  return { success: true, pharmacyId: 'PH-123' };
};
