export interface PurchaseOrder { [key: string]: any; id: string; }
export interface CreatePurchaseOrderInput { [key: string]: any; supplierId?: string; }
export interface ReceivePurchaseOrderInput { [key: string]: any; items?: unknown[]; }
export interface ListPurchaseOrdersParams { [key: string]: any; page?: number; limit?: number; }
