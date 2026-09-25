export interface Product {
  _id: string;
  id?: string;
  tenantId: string;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  category?: string | null;
  unit?: string;
  supplier?: string | null;
  location?: string | null;
  price: number;
  cost: number;
  stock: number;
  lowStockThreshold: number;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  location?: string;
  active?: boolean;
}

export interface CreateProductInput {
  name: string;
  price: number;
  sku?: string;
  barcode?: string;
  category?: string;
  unit?: string;
  supplier?: string;
  location?: string;
  cost?: number;
  stock?: number;
  lowStockThreshold?: number;
  imageUrl?: string;
  imagePublicId?: string;
  active?: boolean;
}