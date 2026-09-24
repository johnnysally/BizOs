export interface SaleItem {
  productId: string;
  name: string;
  sku?: string;
  qty: number;
  price: number;
  subtotal: number;
}

export interface Sale {
  _id: string;
  tenantId: string;
  saleNumber: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  paymentMethod?: string;
  paymentStatus: 'pending' | 'paid' | 'partial' | 'refunded';
  cashierId?: string;
  customerId?: string | null;
  voided: boolean;
  voidReason?: string;
  voidedBy?: string;
  voidedAt?: string;
  receiptUrl?: string;
  receiptPublicId?: string;
  loyaltyPointsEarned?: number;
  loyaltyPointsRedeemed?: number;
  loyaltyDiscountValue?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListSalesParams {
  page?: number;
  limit?: number;
  paymentMethod?: string;
  cashierId?: string;
  period?: string;
}

export interface CreateSaleInput {
  items: Array<{ productId: string; qty: number }>;
  paymentMethod: string;
  customerId?: string;
  discount?: number;
  loyaltyPointsRedeemed?: number;
}