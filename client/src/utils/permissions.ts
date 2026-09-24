import type { UserRole } from '@/types/auth';

export const canManageProducts = (role: UserRole) =>
  role === 'owner' || role === 'manager';

export const canManageInventory = (role: UserRole) =>
  role === 'owner' || role === 'manager';

export const canManageCustomers = (role: UserRole) =>
  role === 'owner' || role === 'manager';

export const canManageSuppliers = (role: UserRole) =>
  role === 'owner' || role === 'manager';

export const canManagePurchaseOrders = (role: UserRole) =>
  role === 'owner' || role === 'manager';

export const canManageInvoices = (role: UserRole) =>
  role === 'owner' || role === 'manager';

export const canManageUsers = (role: UserRole) => role === 'owner';

export const canManageSettings = (role: UserRole) => role === 'owner';

export const canViewReports = (role: UserRole) =>
  role === 'owner' || role === 'manager';

export const canViewInsights = (role: UserRole) =>
  role === 'owner' || role === 'manager';

export const canUseChat = (role: UserRole) =>
  role === 'owner' || role === 'manager';

export const canUsePOS = (_role: UserRole) => true;

export const canVoidSale = (role: UserRole) =>
  role === 'owner' || role === 'manager';

export const canRefund = (role: UserRole) =>
  role === 'owner' || role === 'manager';

export const canApplyDiscount = (_role: UserRole) => true;

export const canViewAllSales = (role: UserRole) =>
  role === 'owner' || role === 'manager';