export interface Product { [key: string]: any; id: string; name: string; }
export interface ListProductsParams { [key: string]: any; page?: number; limit?: number; }
export interface CreateProductInput { [key: string]: any; name: string; }
