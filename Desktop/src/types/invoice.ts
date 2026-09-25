export interface Invoice { [key: string]: any; id: string; invoiceNumber: string; }
export interface CreateInvoiceInput { [key: string]: any; customerId?: string; }
export interface RecordInvoicePaymentInput { [key: string]: any; amount: number; }
export interface ListInvoicesParams { [key: string]: any; page?: number; limit?: number; }
