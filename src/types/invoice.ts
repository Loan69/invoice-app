import { Items } from "./items";

export interface Invoice {
    id_int: number;
    datefac: string;
    items: Items[];
    status: string;
    created_at?: string;
    updated_at?: string;
    client_id: number;
    user_id: string;
    is_credit_note?: boolean;
    original_invoice_id?: number;
  }
  