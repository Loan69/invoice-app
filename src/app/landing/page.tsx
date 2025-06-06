'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LandingPage() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly')

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
        body: JSON.stringify({ userEmail: email, plan: selectedPlan }),
      })

      const data = await res.json()
      
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
      <h1 className="text-4xl font-bold mb-4 text-center">Alfred Facture - Facturation simplifiée pour entrepreneurs</h1>
      <p className="text-lg mb-8 text-center max-w-xl">
        Générez vos factures automatiquement, suivez vos paiements, et restez conforme. 3 jours d’essai gratuit, puis choisissez votre abonnement.
      </p>

      <input
        type="email"
        placeholder="Votre email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-md mb-4 w-64"
      />

      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded-md border ${selectedPlan === 'monthly' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border-gray-300'}`}
          onClick={() => setSelectedPlan('monthly')}
        >
          Mensuel - 9,99€/mois
        </button>
        <button
          className={`px-4 py-2 rounded-md border ${selectedPlan === 'yearly' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border-gray-300'}`}
          onClick={() => setSelectedPlan('yearly')}
        >
          Annuel - 99,90€/an (2 mois offerts)
        </button>
      </div>

      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition cursor-pointer"
      >
        {loading ? 'Chargement...' : 'Commencer'}
      </button>

      {/* Témoignages */}
      <section className="py-20 px-6 bg-white">
        <h2 className="text-2xl font-semibold text-center mb-10">Ils en parlent mieux que nous</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
            <p className="italic">&quot;Enfin un outil simple et efficace pour gérer mes factures. Je recommande vivement !&ldquo;</p>
            <p className="mt-4 font-semibold">— Julien, graphiste freelance</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
            <p className="italic">&quot;J&apos;ai pu envoyer ma première facture en 5 minutes. Interface claire, prise en main rapide.&ldquo;</p>
            <p className="mt-4 font-semibold">— Marie, consultante</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
            <p className="italic">&quot;Service client ultra réactif, et la génération PDF est nickel. Top !&ldquo;</p>
            <p className="mt-4 font-semibold">— Samuel, développeur indépendant</p>
          </div>
        </div>
      </section>

      {/* Offres */}
      <section className="py-20 px-6 bg-gray-100 text-center">
        <h2 className="text-2xl font-semibold mb-6">Offres disponibles</h2>
        <p className="text-lg mb-4">3 jours d&apos;essai gratuit, puis choisissez la formule qui vous convient.</p>
        <div className="flex justify-between items-center gap-8 mt-6">
          <div className="bg-white p-6 rounded-xl shadow-md w-72">
            <h3 className="text-xl font-semibold mb-2">Mensuel</h3>
            <p className="text-2xl font-bold mb-4">9,99€/mois</p>
            <p className="text-gray-600">Sans engagement. Résiliable à tout moment.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md w-72 border border-blue-600">
            <h3 className="text-xl font-semibold mb-2">Annuel</h3>
            <p className="text-2xl font-bold mb-4">99,90€/an</p>
            <p className="text-blue-600 font-medium">2 mois offerts</p>
          </div>
        </div>
      </section>

      <footer className="text-sm text-gray-600 text-center py-10 bg-white border-t">
        <p className="mb-2">
          <Link href="/legal/cgu" className="underline mr-4">CGU</Link>
          <Link href="/legal/politiqueConfidentialite" className="underline mr-4">Politique de confidentialité</Link>
          <Link href="/legal/mentionsLegales" className="underline">Mentions légales</Link>
        </p>
        <p>© {new Date().getFullYear()} Alfred Facture — Tous droits réservés.</p>
      </footer>
    </main>
  )
}
