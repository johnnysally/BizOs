export interface Payment {
  _id: string;
  tenantId: string;
  saleId: string;
  method: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  providerRef?: string | null;
  providerPayload?: Record<string, unknown>;
  refundedAt?: string | null;
  refundedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InitiatePaymentInput {
  saleId: string;
  method: string;
  phone?: string;
  amount?: number;
}

export interface RecordManualPaymentInput {
  saleId: string;
  method: string;
  amount?: number;
  reference?: string;
  note?: string;
  amountReceived?: number;
}