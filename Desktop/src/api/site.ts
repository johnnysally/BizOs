import { api } from './axios';

export interface SiteSettings {
  platformName: string;
  platformLogoUrl: string | null;
  supportEmail: string | null;
  supportPhone: string | null;
  defaultCurrency: string;
  defaultCountry: string;
  minPasswordLength: number;
  registrationOpen: boolean;
  maintenanceMode: boolean;
}

export interface Country {
  code: string;
  name: string;
  currency: string;
  dialCode: string;
}

export interface PublicPlan {
  code: string;
  name: string;
  description?: string;
  price: {
    amount: number;
    currency: string;
    interval: 'once' | 'month' | 'year';
  };
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
  trialDays: number;
}

export const siteApi = {
  getSettings: () =>
    api.get<{ data: SiteSettings }>('/public/site/settings').then((r) => r.data.data),

  getBusinessTypes: () =>
    api.get<{ data: string[] }>('/public/site/business-types').then((r) => r.data.data),

  getCountries: () =>
    api.get<{ data: Country[] }>('/public/site/countries').then((r) => r.data.data),

  getCurrencies: () =>
    api.get<{ data: string[] }>('/public/site/currencies').then((r) => r.data.data),

  getLegalLinks: () =>
    api
      .get<{ data: Record<string, string> }>('/public/site/legal-links')
      .then((r) => r.data.data),

  getFeatureFlags: () =>
    api
      .get<{ data: { registrationOpen: boolean; maintenanceMode: boolean } }>(
        '/public/site/feature-flags'
      )
      .then((r) => r.data.data),

  getPlans: () =>
    api.get<{ data: PublicPlan[] }>('/public/site/plans').then((r) => r.data.data),
};