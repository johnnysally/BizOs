export const ROUTES = {
  home: '/',
  pricing: '/pricing',
  help: '/help',
  downloads: '/downloads',
  register: '/register',
  login: '/login',
  verify: '/verify',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  pending: '/pending',
  legal: (type: string) => `/legal/${type}`,
  pay: (invoiceNumber: string) => `/pay/${invoiceNumber}`,

  app: '/app',
  pos: '/app/pos',
  products: '/app/products',
  productNew: '/app/products/new',
  productEdit: (id: string) => `/app/products/${id}/edit`,
  sales: '/app/sales',
  saleDetail: (id: string) => `/app/sales/${id}`,
  customers: '/app/customers',
  inventory: '/app/inventory',
  suppliers: '/app/suppliers',
  supplierNew: '/app/suppliers/new',
  supplierEdit: (id: string) => `/app/suppliers/${id}/edit`,
  purchaseOrders: '/app/purchase-orders',
  purchaseOrderNew: '/app/purchase-orders/new',
  purchaseOrderDetail: (id: string) => `/app/purchase-orders/${id}`,
  invoices: '/app/invoices',
  invoiceNew: '/app/invoices/new',
  invoiceDetail: (id: string) => `/app/invoices/${id}`,
  users: '/app/users',
  invitations: '/app/invitations',
  settings: '/app/settings',
  profile: '/app/profile',
  insights: '/app/insights',
  chat: '/app/chat',
  reports: '/app/reports',
  forbidden: '/app/403',
};

export const ROLES = {
  OWNER: 'owner',
  MANAGER: 'manager',
  CASHIER: 'cashier',
} as const;

export const USER_STATUS = {
  PENDING: 'pending_user',
  ACTIVE: 'active',
  INVITED: 'invited',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
} as const;

export const TENANT_STATUS = {
  PENDING_USER: 'pending_user',
  ACTIVE: 'active',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
  EXPIRED: 'expired',
} as const;

export const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Cash',
  card: 'Card',
  mpesa: 'M-Pesa',
  mpesa_stk: 'M-Pesa STK',
  mpesa_send: 'M-Pesa Send Money',
  mpesa_till: 'M-Pesa Till',
  mpesa_paybill: 'M-Pesa Paybill',
  stripe: 'Card (Stripe)',
  paystack: 'Paystack',
  flutterwave: 'Flutterwave',
  bank: 'Bank Transfer',
  bank_transfer: 'Bank Transfer',
  store_credit: 'Store Credit',
};

export const LEGAL_TYPES = ['terms', 'privacy', 'dpa', 'refund', 'aup'] as const;

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const TOAST_DURATION = 4000;