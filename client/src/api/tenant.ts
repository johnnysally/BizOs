import type { TenantSettings } from '@/api/settings';

export interface Tenant {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  country: string;
  businessType: 'retail' | 'restaurant' | 'salon' | 'pharmacy' | 'other';
  status: 'pending_user' | 'active' | 'rejected' | 'suspended' | 'expired';
  planId: string;
  ownerId?: string;
  registeredAt?: string;
  approvedAt?: string | null;
  expiresAt?: string | null;
  settings: TenantSettings;
  createdAt?: string;
  updatedAt?: string;
}