import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const { userEmail, plan } = await req.json()

  if (!userEmail || !plan) {
    return NextResponse.json({ error: 'Email ou plan manquant' }, { status: 400 })
  }

  const priceId = plan === 'yearly'
    ? process.env.STRIPE_PRICE_YEARLY_ID
    : process.env.STRIPE_PRICE_MONTHLY_ID

  if (!priceId) {
    return NextResponse.json({ error: 'ID de prix Stripe manquant' }, { status: 500 })
  }

  try {

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      automatic_tax: { enabled: true },
      customer_email: userEmail,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/aboSuccess?success=true&email=${userEmail}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/landing?canceled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    console.error("Stripe error", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}