'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LandingPage() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')

  const handleSubscribe = async () => {
    if (!email) {
      alert("Veuillez entrer votre email.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: email }),
      })

      const data = await res.json()
      console.log(data)
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Erreur lors de la redirection.')
      }
    } catch (error) {
      console.error(error)
      alert("Erreur lors de la création de la session.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-white text-gray-900">
      <h1 className="text-4xl font-bold mb-4">Facturation simplifiée pour micro-entrepreneurs</h1>
      <p className="text-lg mb-8 text-center max-w-xl">
        Générez vos factures automatiquement, suivez vos paiements, et restez conforme. 3 jours d’essai gratuit, puis 9,99€/mois.
      </p>

      <input
        type="email"
        placeholder="Votre email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-md mb-4 w-64"
      />

      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition cursor-pointer"
      >
        {loading ? 'Chargement...' : 'Commencer'}
      </button>
      <section className="py-20 px-6 bg-white">
        <h2 className="text-2xl font-semibold text-center mb-10">Ils en parlent mieux que nous</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
            <p className="italic">"Enfin un outil simple et efficace pour gérer mes factures. Je recommande vivement !"</p>
            <p className="mt-4 font-semibold">— Julien, graphiste freelance</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
            <p className="italic">"J’ai pu envoyer ma première facture en 5 minutes. Interface claire, prise en main rapide."</p>
            <p className="mt-4 font-semibold">— Marie, consultante</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
            <p className="italic">"Service client ultra réactif, et la génération PDF est nickel. Top !"</p>
            <p className="mt-4 font-semibold">— Samuel, développeur indépendant</p>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gray-100 text-center">
        <h2 className="text-2xl font-semibold mb-6">Offre</h2>
        <p className="text-lg mb-4">Profitez de 3 jours d’essai gratuit, puis passez à l’abonnement mensuel pour 9,90€/mois.</p>
        <p className="text-gray-600">Sans engagement. Résiliable à tout moment.</p>
      </section>

      <footer className="text-sm text-gray-600 text-center py-10 bg-white border-t">
        <p className="mb-2">
          <Link href="/cgu" className="underline mr-4">CGU</Link>
          <Link href="/confidentialite" className="underline mr-4">Politique de confidentialité</Link>
          <Link href="/mentions-legales" className="underline">Mentions légales</Link>
        </p>
        <p>© {new Date().getFullYear()} Facturation Simplifiée — Tous droits réservés.</p>
      </footer>
    </main>
  )
}
