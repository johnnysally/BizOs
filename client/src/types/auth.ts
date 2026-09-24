export type UserRole = 'owner' | 'manager' | 'cashier';

export type UserStatus =
  | 'pending_user'
  | 'active'
  | 'invited'
  | 'rejected'
  | 'suspended';

export type AuthScope = 'pending' | 'active';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  status: UserStatus;
  mustChangePassword?: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug?: string;
  status: string;
  planId: string;
}

export interface Plan {
  code: string;
  name: string;
  limits: {
    maxOwners: number;
    maxManagers: number;
    maxCashiers: number;
    maxProducts: number;
    maxTransactionsPerMonth: number;
    maxAiCallsPerDay: number;
  };
  features: {
    aiInsights: boolean;
    multiLocation: boolean;
    api: boolean;
    prioritySupport: boolean;
    customDomain: boolean;
  };
}

export interface LatestInvoice {
  number: string;
  status: string;
  amountDue: number;
  amountPaid: number;
  currency: string;
  dueDate?: string | null;
  pdfUrl?: string | null;
  payUrl: string;
}

export interface RegisterInput {
  businessName: string;
  ownerName: string;
  email: string;
  phone?: string;
  country?: string;
  businessType?: string;
  password: string;
  planId: string;
}

export interface RegisterResponse {
  user: User;
  tenant: Tenant;
  plan: Plan;
  accessToken: string;
  refreshToken: string;
  message?: string | null;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  message?: string | null;
  user: User;
  tenant: Tenant;
  plan: Plan | null;
  invoice: LatestInvoice | null;
  scope: AuthScope;
}

export interface MeResponse {
  user: User;
  tenant: Tenant;
  plan: Plan | null;
  invoice: LatestInvoice | null;
  scope: AuthScope;
}

export interface CreateStaffInput {
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
}

export interface UserInvitation {
  _id: string;
  tenantId: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  token: string;
  invitedBy: string;
  expiresAt: string;
  acceptedAt?: string | null;
  createdAt: string;
}