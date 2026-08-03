// ============================================================================
// Platform auth models — mirrors PLATFORM_FRONTEND_GUIDE.md §2 & §3
// Login is email + password (NO subdomain). Users sit above all gyms.
// ============================================================================

// Platform permission catalog carried in the JWT / login response.
export type Permission =
  | 'ManagePlatform'
  | 'ManageTenants'
  | 'ManagePlans'
  | 'ManagePaymentRequests'
  | 'ManagePlatformReports'
  | 'ManagePlatformBackups';

export const Permissions = {
  ManagePlatform: 'ManagePlatform',
  ManageTenants: 'ManageTenants',
  ManagePlans: 'ManagePlans',
  ManagePaymentRequests: 'ManagePaymentRequests',
  ManagePlatformReports: 'ManagePlatformReports',
  ManagePlatformBackups: 'ManagePlatformBackups',
} as const;

export interface LoginRequest {
  email: string;
  password: string;
}

// AuthResponseDto from the Platform API
export interface AuthResponse {
  userId: string;
  email: string;
  phoneNumber: string | null;
  fullName: string;
  role: string;
  roles: string[];
  permissions: Permission[];
  tenantId: string;
  accessToken: string;
  expiresAt: string;
}

// User info stored locally
export interface UserInfo {
  id: string;
  email: string;
  fullName: string;
  role: string;
  roles: string[];
  tenantId: string;
}
