export interface Profile {
    id: number;
    last_name?: string;
    first_name?: string;
    is_admin?: boolean;
    address?: string;
    email?: string;
    company?: string;
    phone?: string;
    siret?: string;
    bank_details?: {
      iban?: string;
      bic?: string;
      bank_name?: string;
    };
    vat_applicable?: boolean;
    tax_status?: string;
    created_at?: string;
    updated_at?: string;
  }
  