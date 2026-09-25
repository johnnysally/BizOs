export interface HeldSaleItem {
  productId: string;
  name: string;
  sku?: string | null;
  price: number;
  qty: number;
  stock: number;
  unit?: string | null;
}

export interface HeldSale {
  _id: string;
  tenantId: string;
  cashierId: string;
  label: string;
  customerId?: string | null;
  items: HeldSaleItem[];
  discount: string;
  note: string;
  resumedAt?: string | null;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHeldSaleInput {
  items: HeldSaleItem[];
  label?: string;
  customerId?: string;
  discount?: string;
  note?: string;
}