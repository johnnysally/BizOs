import { api } from './axios';
import type { ApiPaginated } from '@/types/api';

export interface CustomerInvoiceItem {
  productId?: string | null;
  name: string;
  description?: string | null;
  qty: number;
  unitPrice: number;
  subtotal: number;
}

export interface CustomerInvoicePayment {
  amount: number;
  method?: string | null;
  reference?: string | null;
  note?: string | null;
  recordedBy?: string | null;
  recordedAt: string;
}

export interface CustomerInvoice {
  _id: string;
  tenantId: string;
  type: 'customer';
  invoiceNumber: string;
  customerId?: string | null;
  customerSnapshot: {
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  };
  items: CustomerInvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  currency: string;
  status: 'draft' | 'sent' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  dueDate?: string | null;
  issuedAt?: string | null;
  sentAt?: string | null;
  paidAt?: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  paymentMethod?: string | null;
  paymentRef?: string | null;
  payments: CustomerInvoicePayment[];
  notes?: string | null;
  stockDeducted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerInvoiceSummary {
  total: number;
  totalPaid: number;
  totalDue: number;
  count: number;
  draft: number;
  sent: number;
  paid: number;
  overdue: number;
}

export interface CreateCustomerInvoiceInput {
  customerId: string;
  items: Array<{
    productId?: string;
    name?: string;
    description?: string;
    qty: number;
    unitPrice?: number;
  }>;
  discount?: number;
  dueDate?: string;
  notes?: string;
}

export const customerInvoiceApi = {
  list: (params: {
    page?: number;
    limit?: number;
    status?: string;
    customerId?: string;
    search?: string;
  } = {}) =>
    api
      .get<ApiPaginated<CustomerInvoice>>('/client/invoices/customer', { params })
      .then((r) => r.data),

  get: (id: string) =>
    api
      .get<{ data: CustomerInvoice }>(`/client/invoices/customer/${id}`)
      .then((r) => r.data.data),

  summary: () =>
    api
      .get<{ data: CustomerInvoiceSummary }>('/client/invoices/customer/summary')
      .then((r) => r.data.data),

  create: (payload: CreateCustomerInvoiceInput) =>
    api
      .post<{ data: CustomerInvoice }>('/client/invoices/customer', payload)
      .then((r) => r.data.data),

  send: (id: string) =>
    api
      .post<{ data: CustomerInvoice }>(`/client/invoices/customer/${id}/send`)
      .then((r) => r.data.data),

  recordPayment: (
    id: string,
    payload: { amount: number; method?: string; reference?: string; note?: string }
  ) =>
    api
      .post<{ data: CustomerInvoice }>(
        `/client/invoices/customer/${id}/payments`,
        payload
      )
      .then((r) => r.data.data),

  cancel: (id: string, reason?: string) =>
    api
      .post<{ data: CustomerInvoice }>(`/client/invoices/customer/${id}/cancel`, {
        reason,
      })
      .then((r) => r.data.data),
};