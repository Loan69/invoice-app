import { Items } from "./items";

export interface Template {
    id_int: number;
    name: string;
    items: Items;
    status: string;
    created_at?: string;
    updated_at?: string;
    user_id: string;
  }
  