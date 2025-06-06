import { Invoice } from "./invoice"
import { Client } from "./client"

export type InvoiceWithClient = Invoice & {
  clients?: Pick<Client, 'id_int' | 'company' | 'last_name' | 'first_name' | 'address' | 'email' | 'is_professional'>
}
