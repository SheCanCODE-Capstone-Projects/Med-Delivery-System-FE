// Mock implementations for now until API is ready

/**
 * Authenticates a user with mock credentials.
 * Returns a mock JWT token and user role for testing purposes.
 * 
 * @param _credentials - The login credentials (currently unused in mock)
 * @returns Object containing token and user with role
 */
export const login = async (_credentials) => {
  // return apiClient('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
  return { token: 'mock-jwt-token', user: { role: 'PATIENT' } };
};

/**
 * Registers a new patient account (placeholder until real API is connected).
 * 
 * @param _data - The patient registration data (currently unused)
 * @returns Object indicating success
 */
export const registerPatient = async (_data) => {
  return { success: true };
};

/**
 * Registers a new pharmacy account (placeholder until real API is connected).
 * 
 * @param _data - The pharmacy registration data (currently unused)
 * @returns Object indicating success and a mock pharmacy ID
 */
export const registerPharmacy = async (_data) => {
  return { success: true, pharmacyId: 'PH-123' };
};