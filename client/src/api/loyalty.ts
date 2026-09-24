import { api } from './axios';

export interface LoyaltyConfig {
  loyaltyEnabled: boolean;
  loyaltyPointsPerCurrency: number;
  loyaltyCurrencyUnit: number;
  loyaltyRedeemRate: number;
  loyaltyMinRedeem: number;
}

export interface LoyaltyBalance {
  customerId: string;
  name: string;
  points: number;
  tier: 'none' | 'bronze' | 'silver' | 'gold';
  updatedAt: string | null;
}

export interface LoyaltyTransaction {
  _id: string;
  tenantId: string;
  customerId: string;
  type: 'earn' | 'redeem' | 'adjust' | 'expire' | 'refund';
  points: number;
  balanceAfter: number;
  reason?: string | null;
  refType?: string | null;
  refId?: string | null;
  userId?: string | null;
  createdAt: string;
}

export interface AdjustResult {
  points: number;
  tier: string;
  transaction: LoyaltyTransaction;
  value?: number;
  currency?: string;
}

export const loyaltyApi = {
  getConfig: () =>
    api
      .get<{ data: LoyaltyConfig }>('/client/loyalty/config')
      .then((r) => r.data.data),

  getBalance: (customerId: string) =>
    api
      .get<{ data: LoyaltyBalance }>(`/client/loyalty/customers/${customerId}`)
      .then((r) => r.data.data),

  getHistory: (customerId: string, params: { page?: number; limit?: number } = {}) =>
    api
      .get<{
        success: true;
        data: LoyaltyTransaction[];
        meta: { page: number; limit: number; total: number; pages: number };
      }>(`/client/loyalty/customers/${customerId}/history`, { params })
      .then((r) => r.data),

  adjust: (customerId: string, points: number, reason?: string) =>
    api
      .post<{ data: AdjustResult }>(
        `/client/loyalty/customers/${customerId}/adjust`,
        { points, reason }
      )
      .then((r) => r.data.data),

  redeem: (customerId: string, points: number, reason?: string) =>
    api
      .post<{ data: AdjustResult }>(
        `/client/loyalty/customers/${customerId}/redeem`,
        { points, reason }
      )
      .then((r) => r.data.data),
};