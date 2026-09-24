export interface Supplier { [key: string]: any; id: string; name: string; }
export interface CreateSupplierInput { [key: string]: any; name: string; }
export interface ListSuppliersParams { [key: string]: any; page?: number; limit?: number; }
