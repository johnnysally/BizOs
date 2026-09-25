import { api } from './axios';
import type { ApiPaginated } from '@/types/api';

export interface ClientInvoiceItem {
  productId?: string | null;
  name: string;
  description?: string | null;
  qty: number;
  unitPrice: number;
  subtotal: number;
}

export interface ClientInvoice {
  _id: string;
  invoiceNumber: string;
  customerSnapshot: {
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  };
  items: ClientInvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  currency: string;
  status: 'draft' | 'sent' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  issuedAt?: string | null;
  dueDate?: string | null;
  paidAt?: string | null;
  paymentMethod?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceSummary {
  total: number;
  totalPaid: number;
  totalDue: number;
  count: number;
  paid: number;
  overdue: number;
}

export const clientInvoiceApi = {
  list: (params: { page?: number; limit?: number; status?: string } = {}) =>
    api
      .get<ApiPaginated<ClientInvoice>>('/client/invoices', { params })
      .then((r) => r.data),

  get: (id: string) =>
    api
      .get<{ data: ClientInvoice }>(`/client/invoices/${id}`)
      .then((r) => r.data.data),

  summary: () =>
    api
      .get<{ data: InvoiceSummary }>('/client/invoices/summary')
      .then((r) => r.data.data),
};