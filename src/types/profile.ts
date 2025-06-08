export interface BankDetails {
  iban?: string;
  bic?: string;
  bank_name?: string;
}

export interface Profile {
  id: string;
  last_name?: string;
  first_name?: string;
  is_admin?: boolean;
  address?: string;
  email?: string;
  company?: string;
  phone?: string;
  siret?: string;
  rib?: string;
  vat_applicable?: boolean;
  tax_status?: string;
  created_at?: string;
  updated_at?: string;
  bank_details?: BankDetails;
  is_demo?: boolean;
  is_subscribed?: boolean;
  demo_started_at?: string;
  demo_expires_at?: string;
  subscription_started_at?: string;
}
