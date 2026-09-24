export interface Customer {
  _id: string;
  id?: string;
  tenantId: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  totalSpent: number;
  lastPurchaseAt?: string | null;
  active: boolean;
  points: number;
  pointsUpdatedAt?: string | null;
  loyaltyTier: 'none' | 'bronze' | 'silver' | 'gold';
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerInput {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}