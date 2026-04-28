import { apiClient } from './apiClient';

// Mock implementations for now until API is ready

export const login = async (credentials) => {
  // return apiClient('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
  return { token: 'mock-jwt-token', user: { role: 'PATIENT' } };
};

export const registerPatient = async (data) => {
  return { success: true };
};

export const registerPharmacy = async (data) => {
  return { success: true, pharmacyId: 'PH-123' };
};
