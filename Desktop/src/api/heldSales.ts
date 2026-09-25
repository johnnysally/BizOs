import { api } from './axios';
import type { HeldSale, CreateHeldSaleInput } from '@/types/heldSale';

export const heldSalesApi = {
  list: () =>
    api.get<{ data: HeldSale[] }>('/client/held-sales').then((r) => r.data.data),

  create: (payload: CreateHeldSaleInput) =>
    api
      .post<{ data: HeldSale }>('/client/held-sales', payload)
      .then((r) => r.data.data),

  resume: (id: string) =>
    api
      .post<{ data: HeldSale }>(`/client/held-sales/${id}/resume`)
      .then((r) => r.data.data),

  remove: (id: string) =>
    api.delete(`/client/held-sales/${id}`).then((r) => r.data),
};