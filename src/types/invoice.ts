export interface Invoice {
    id_int: number;
    datefac: string;
    description: string;
    amount: number;
    status: string;
    created_at?: string;
    updated_at?: string;
    client_id: number;
    user_id: string;
    is_credit_note?: boolean;
    original_invoice_id?: number;
  }
  