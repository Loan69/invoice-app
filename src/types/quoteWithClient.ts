import { Quote } from "./quote"
import { Client } from "./client"

export type QuoteWithClient = Quote & {
  clients?: Pick<Client, 'id_int' | 'company' | 'last_name' | 'first_name' | 'address' | 'email' | 'is_professional'>
}
