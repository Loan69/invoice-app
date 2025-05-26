export interface Client {
    id_int: number;
    last_name: string;
    first_name: string;
    siret?: string;
    address?: string;
    email?: string;
    phone?: string;
    company?: string;
    created_at?: string;
    updated_at?: string;
    user_id: string;
    is_professional?: boolean;
  }
  