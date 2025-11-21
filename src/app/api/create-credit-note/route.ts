import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// --- Types ---
type InvoiceItem = {
  amount: string; 
  description: string;
};

type Invoice = {
  id_int: number;
  created_at: string;
  items: InvoiceItem[];
  is_credit_note: boolean;
  original_invoice_id?: number;
};

// --- Utils ---
function invertAmountString(amount: string): string {
  const normalized = amount.replace(",", "."); // "123,00" → "123.00"
  const num = parseFloat(normalized);
  const inverted = -Math.abs(num);             // -123
  return inverted.toFixed(2).replace(".", ","); // "-123,00"
}

export async function POST(req: Request) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );

  // Auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { invoiceId } = await req.json();

  // Récupérer facture originale
  const { data: original, error: fetchError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id_int', invoiceId)
    .maybeSingle<Invoice>();

  if (fetchError || !original) {
    return NextResponse.json({ error: 'Facture introuvable.' }, { status: 404 });
  }

  // 1. Construire items inversés
  const invertedItems: InvoiceItem[] = original.items.map((item) => ({
    ...item,
    amount: invertAmountString(item.amount),
  }));

  // 2. Récupérer le prochain id_int
  const { data: maxResult, error: maxError } = await supabase
    .from("invoices")
    .select("id_int")
    .order("id_int", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (maxError) {
    return NextResponse.json({ error: maxError.message }, { status: 500 });
  }

  const nextId = (maxResult?.id_int ?? 0) + 1;

  // 3. Construire l'avoir
  const creditNotePayload = {
    ...original,
    id_int: nextId,
    created_at: new Date().toISOString(),
    items: invertedItems,
    is_credit_note: true,
    original_invoice_id: original.id_int,
  };

  // 4. Insérer
  const { error: insertError } = await supabase
    .from("invoices")
    .insert(creditNotePayload);

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
