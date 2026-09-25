export interface DailyMetric {
  _id: string;
  tenantId: string;
  date: string;
  totalSales: number;
  totalTransactions: number;
  avgBasket: number;
  grossProfit: number;
  topProducts: Array<{ name: string; qty: number; revenue: number }>;
  hourlyBreakdown: Array<{ hour: number; sales: number; transactions: number }>;
  paymentSplit: Record<string, number>;
}

export interface StockAlert {
  _id: string;
  name: string;
  stock: number;
  lowStockThreshold: number;
}