import { api } from './axios';

export interface PlatformSettings {
  platform_name?: string;
  platform_logo_url?: string | null;
  support_email?: string;
  support_phone?: string;
  platform_website?: string;
  default_currency?: string;
  default_country?: string;
  default_tax_rate?: number;
  tax_inclusive?: boolean;
  min_password_length?: number;
  registration_open?: boolean;
  maintenance_mode?: boolean;
  max_owners_per_tenant?: number;
  cashier_discount_limit?: number;
  cashier_refund_limit?: number;
  manager_can_invite_cashier?: boolean;
  require_shift_clock_in?: boolean;
  backup_auto_enabled?: boolean;
  backup_frequency?: 'daily' | 'weekly' | 'monthly';
  backup_time?: string;
  backup_retention_days?: number;
  backup_notify_on_fail?: boolean;
  backup_notify_emails?: string[];
  business_types?: string[];
  countries?: Array<{ code: string; name: string; currency: string; dialCode: string }>;
  currencies?: string[];
  [key: string]: unknown;
}

export interface FeatureFlags {
  feature_pos: boolean;
  feature_inventory: boolean;
  feature_ai_insights: boolean;
  feature_multi_location: boolean;
  feature_loyalty: boolean;
  feature_storefront: boolean;
  feature_accounting: boolean;
  feature_api: boolean;
  feature_purchase_orders: boolean;
  feature_invoices: boolean;
}

export type UpdateSettingsPayload = Partial<PlatformSettings>;
export type UpdateFeaturesPayload = Partial<FeatureFlags>;

export interface DownloadItem {
  id: string;
  name: string;
  version?: string | null;
  link: string;
  platform: string;
  description?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
}

export interface CreateDownloadPayload {
  name: string;
  version?: string;
  link: string;
  platform: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export const settingsApi = {
  get: () =>
    api
      .get<{ data: PlatformSettings }>('/admin/settings')
      .then((r) => r.data.data),

  update: (payload: UpdateSettingsPayload) =>
    api
      .patch<{ data: PlatformSettings }>('/admin/settings', payload)
      .then((r) => r.data.data),

  getPublic: () =>
    api
      .get<{ data: PlatformSettings }>('/admin/settings/public')
      .then((r) => r.data.data),

  getFeatures: () =>
    api
      .get<{ data: FeatureFlags }>('/admin/settings/features')
      .then((r) => r.data.data),

  updateFeatures: (payload: UpdateFeaturesPayload) =>
    api
      .patch<{ data: FeatureFlags }>('/admin/settings/features', payload)
      .then((r) => r.data.data),

  getDownloads: () =>
    api
      .get<{ data: DownloadItem[] }>('/admin/settings/downloads')
      .then((r) => r.data.data),

  createDownload: (payload: CreateDownloadPayload) =>
    api
      .post<{ data: DownloadItem }>('/admin/settings/downloads', payload)
      .then((r) => r.data.data),

  updateDownload: (id: string, payload: Partial<CreateDownloadPayload> & { isActive?: boolean }) =>
    api
      .patch<{ data: DownloadItem }>(`/admin/settings/downloads/${id}`, payload)
      .then((r) => r.data.data),

  deleteDownload: (id: string) =>
    api
      .delete(`/admin/settings/downloads/${id}`)
      .then((r) => r.data),
};