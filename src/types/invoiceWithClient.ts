import { Invoice } from "./invoice"
import { Client } from "./client"

export type InvoiceWithClient = Invoice & {
  clients?: Pick<Client, 'id_int' | 'company'>
}
