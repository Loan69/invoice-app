import { Items } from "./items";

export interface Quote {
    id_int: number;
    title?: string;
    datequo: string;
    items: Items[];
    status: string;
    created_at?: string;
    updated_at?: string;
    client_id: number;
    user_id: string;
}