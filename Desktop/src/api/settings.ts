import { api } from './axios';

export interface TenantSettings {
  phone?: string | null;
  address?: string | null;
  taxPin?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  logoPublicId?: string | null;

  currency?: string;
  taxRate?: number;
  taxInclusive?: boolean;

  receiptTemplate?: 'modern' | 'detailed' | 'minimal';
  receiptFooter?: string;
  receiptShowLogo?: boolean;
  receiptShowTax?: boolean;
  receiptShowCustomer?: boolean;
  receiptShowCashier?: boolean;
  receiptPaperSize?: '58mm' | '80mm' | 'A4' | 'A5';
  receiptCopies?: number;

  loyaltyEnabled?: boolean;
  loyaltyPointsPerCurrency?: number;
  loyaltyCurrencyUnit?: number;
  loyaltyRedeemRate?: number;
  loyaltyMinRedeem?: number;

  paymentMethods?: string[];

  compactMode?: boolean;
  sounds?: boolean;
}

export interface TenantPaymentMethod {
  code: string;
  label: string;
  mode?: 'auto' | 'manual';
}

export interface BusinessInfo {
  name: string;
  country: string;
  businessType: string;
  slug: string;
}

export interface SettingsResponse {
  settings: TenantSettings;
  business: BusinessInfo;
  paymentMethods: TenantPaymentMethod[];
  enabledPaymentMethods: string[];
}

export const settingsApi = {
  get: () =>
    api.get<{ data: SettingsResponse }>('/client/settings').then((r) => r.data.data),

  update: (patch: Partial<TenantSettings>) =>
    api
      .patch<{ data: TenantSettings }>('/client/settings', patch)
      .then((r) => r.data.data),

  enablePayment: (code: string) =>
    api
      .post<{ data: { enabledPaymentMethods: string[] } }>(
        `/client/settings/payments/${code}/enable`
      )
      .then((r) => r.data.data),

  disablePayment: (code: string) =>
    api
      .delete<{ data: { enabledPaymentMethods: string[] } }>(
        `/client/settings/payments/${code}`
      )
      .then((r) => r.data.data),
};