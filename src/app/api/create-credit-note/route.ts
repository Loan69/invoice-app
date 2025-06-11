import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { invoiceId } = await req.json();

  // Récupérer la facture d’origine
  const { data: original, error: fetchError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id_int', invoiceId)
    .maybeSingle();

  if (fetchError || !original) {
    return NextResponse.json({ error: 'Facture introuvable.' }, { status: 404 });
  }

  // Créer l’avoir : même contenu, mais montant négatif, et est_credit_note = true
  const { error: insertError } = await supabase.from('invoices').insert({
    ...original,
    id_int: undefined, // important pour éviter le conflit de clé
    created_at: new Date().toISOString(),
    amount: -Math.abs(original.amount),
    is_credit_note: true,
    original_invoice_id: original.id_int,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
