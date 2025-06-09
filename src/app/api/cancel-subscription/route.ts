import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const { userEmail } = await req.json()
  if (!userEmail) {
    return NextResponse.json({ error: "Email manquant" }, { status: 400 })
  }

  try {
    const customers = await stripe.customers.list({ email: userEmail })
    if (!customers.data.length) {
      return NextResponse.json({ error: "Client introuvable" }, { status: 404 })
    }
    const customerId = customers.data[0].id

    const subsRes = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    })
    if (!subsRes.data.length) {
      return NextResponse.json({ error: "Aucun abonnement actif" }, { status: 404 })
    }

    const subscription = subsRes.data[0]

    // ☑️ Annulation à la fin de la période courante
    const updated = await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true,
    })
    // Lecture du timestamp sur les items
    const item = updated.items.data[0]
    const endTimestamp = item.current_period_end
    const abo_end_date = new Date(endTimestamp * 1000).toISOString()

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      abo_end_date,
    })
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
    return NextResponse.json({ error: "Erreur inconnue" }, { status: 500 })
  }
}
