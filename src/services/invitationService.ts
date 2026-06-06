import { apiClient } from './apiClient';

export interface InvitationValidateResponse {
  email: string;
  type: string;
  payload: string;
}

export interface PharmacyAdminSetupRequest {
  token: string;
  fullName: string;
  password: string;
  pharmacyName: string;
  pharmacyCode: string;
  licenseNumber: string;
  address: string;
  contactInfo?: string;
  latitude?: number;
  longitude?: number;
  insuranceProviderIds?: number[];
}

export interface BranchManagerSetupRequest {
  token: string;
  fullName: string;
  password: string;
  branchName: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  contactInfo?: string;
}

export async function validateInvitationToken(token: string): Promise<InvitationValidateResponse> {
  const r = await apiClient<{ data: InvitationValidateResponse }>(
    `/api/invitations/validate?token=${encodeURIComponent(token)}`
  );
  return r.data;
}

export async function setupPharmacyAdmin(request: PharmacyAdminSetupRequest): Promise<void> {
  await apiClient('/api/invitations/pharmacy-admin-setup', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function setupBranchManager(request: BranchManagerSetupRequest): Promise<void> {
  await apiClient('/api/invitations/branch-manager-setup', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function invitePharmacyAdmin(email: string): Promise<void> {
  await apiClient('/api/admin/pharmacy-admin/invite', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}
