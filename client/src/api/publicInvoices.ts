import { api } from './axios';

export interface PublicInvoice {
  _id: string;
  invoiceNumber: string;
  customerSnapshot: {
    name: string;
    email?: string | null;
    phone?: string | null;
  };
  items: Array<{
    productId: string | null;
    name: string;
    description?: string | null;
    qty: number;
    unitPrice: number;
    subtotal: number;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  currency: string;
  status: string;
  issuedAt: string;
  dueDate: string;
  paidAt?: string | null;
  paymentMethod?: string | null;
  paymentRef?: string | null;
  notes?: string | null;
  paymentInstructions?: Array<{
    code: string;
    mode: string;
    title: string;
    description?: string;
    steps?: string[];
    action?: { type: string; label: string };
  }>;
}

export const publicInvoiceApi = {
  get: (invoiceNumber: string) =>
    api
      .get<{ data: PublicInvoice }>(`/public/invoices/${invoiceNumber}`)
      .then((r) => r.data.data),

  sendStk: (invoiceNumber: string, phone: string) =>
    api
      .post<{ data: { checkoutRequestId: string; message?: string } }>(
        '/public/payments/stk/invoice',
        { invoiceNumber, phone }
      )
      .then((r) => r.data.data),
};