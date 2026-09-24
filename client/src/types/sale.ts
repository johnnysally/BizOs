export interface Sale { [key: string]: any; id: string; total: number; }
export interface ListSalesParams { [key: string]: any; page?: number; limit?: number; }
export interface CreateSaleInput { [key: string]: any; items: unknown[]; }
