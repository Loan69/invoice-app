// app/api/transform-quote-to-invoice/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  try {
    const body = await req.json();
    const quoteId = body.quoteId;

    if (!quoteId) {
      console.error('❌ quoteId manquant');
      return NextResponse.json({ error: 'ID du devis manquant.' }, { status: 400 });
    }

    const { data: quote, error: errorQuote } = await supabase
      .from('quotes')
      .select('*')
      .eq('id_int', quoteId)
      .single();

    if (errorQuote || !quote) {
      console.error('❌ Erreur récupération devis:', errorQuote);
      return NextResponse.json({ error: 'Devis non trouvé.' }, { status: 404 });
    }

    if (quote.status !== 'Accepté') {
      console.error('❌ Devis non accepté');
      return NextResponse.json({ error: 'Le devis doit être accepté.' }, { status: 400 });
    }

    const { data: lastInvoice, error: errorLast } = await supabase
      .from('invoices')
      .select('id_int')
      .order('id_int', { ascending: false })
      .limit(1)
      .single();

    if (errorLast) {
      console.error('❌ Erreur récupération dernière facture:', errorLast);
    }

    let newNumero: string;
    if (!lastInvoice) {
      newNumero = '0001';
    } else {
      const lastNumber = parseInt(lastInvoice.id_int);
      const nextNumber = (lastNumber + 1).toString().padStart(4, '0');
      newNumero = nextNumber;
    }

    const now = new Date();
      const localTimestamp = new Date(
        now.getTime() - now.getTimezoneOffset() * 60000
      ).toISOString().slice(0, 19); //  slice(0, 19) supprime les millisecondes et le Z final (UTC) pour obtenir un format lisible local à la seconde :


    const { data: invoice, error: errorInvoice } = await supabase
      .from('invoices')
      .insert([
        {
          client_id: quote.client_id,
          datefac: new Date().toISOString(),
          created_at: localTimestamp,
          is_credit_note: false,
          id_int: newNumero,
          items: quote.items,
          status: 'À régler',
          quote_id: quote.id_int,
          user_id: user?.id
        },
      ])
      .select()
      .single();

    if (errorInvoice || !invoice) {
      console.error('❌ Erreur création facture:', errorInvoice);
      return NextResponse.json({ error: 'Erreur lors de la création de la facture.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Facture créée avec succès.', invoice });

  } catch (err) {
    console.error('💥 Erreur dans transformQuoteToInvoice:', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
