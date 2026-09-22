import { api } from './axios';
import type { Payment, InitiatePaymentInput } from '@/types/payment';
import type { ApiPaginated } from '@/types/api';

export const paymentApi = {
  list: (params: { page?: number; limit?: number; saleId?: string; status?: string } = {}) =>
    api
      .get<ApiPaginated<Payment>>('/client/payments', { params })
      .then((r) => r.data),

  initiate: (payload: InitiatePaymentInput) =>
    api
      .post<{ data: { paymentId: string; checkoutRequestId?: string; message?: string } }>(
        '/client/payments/initiate',
        payload
      )
      .then((r) => r.data.data),

  recordManual: (payload: {
    saleId: string;
    method: string;
    amount?: number;
    reference?: string;
    note?: string;
    amountReceived?: number;
  }) =>
    api.post<{ data: Payment }>('/client/payments/manual', payload).then((r) => r.data.data),

  refund: (id: string, reason?: string) =>
    api
      .post<{ data: Payment }>(`/client/payments/${id}/refund`, { reason })
      .then((r) => r.data.data),
};