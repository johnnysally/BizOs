export type PurchaseOrderStatus =
  | 'draft'
  | 'sent'
  | 'partial'
  | 'received'
  | 'cancelled';

export interface PurchaseOrderItem {
  productId?: string | null;
  name: string;
  sku?: string | null;
  qty: number;
  unitCost: number;
  subtotal: number;
  receivedQty: number;
}

export interface PurchaseOrder {
  _id: string;
  tenantId: string;
  poNumber: string;
  supplierId: string;
  supplierSnapshot: {
    name?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
  };
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  status: PurchaseOrderStatus;
  notes?: string | null;
  expectedAt?: string | null;
  sentAt?: string | null;
  receivedAt?: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  createdBy?: string | null;
  receivedBy?: string | null;
  pdfUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePurchaseOrderInput {
  supplierId: string;
  items: Array<{
    productId?: string;
    name?: string;
    sku?: string;
    qty: number;
    unitCost: number;
  }>;
  shipping?: number;
  notes?: string;
  expectedAt?: string;
}

export interface ReceivePurchaseOrderInput {
  items?: Array<{ index: number; qty: number }>;
}

export interface ListPurchaseOrdersParams {
  page?: number;
  limit?: number;
  status?: PurchaseOrderStatus;
  supplierId?: string;
  search?: string;
}