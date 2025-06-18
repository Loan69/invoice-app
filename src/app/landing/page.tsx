'use client'

import { useState } from 'react'
import Link from 'next/link'
import ImageCarousel from '../components/ImageCarousel'

export default function LandingPage() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly')

  const handleSubscribe = async () => {
    if (!email) {
      alert('Veuillez entrer votre email avant de choisir une offre.');
      return;
    }

    setLoading(true)
    try {
      localStorage.setItem('origin', 'direct')
      localStorage.setItem('abo_plan', selectedPlan);
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
    <div>
       {/* Header en haut à droite */}
       <header className="fixed top-0 right-0 left-0 flex justify-between items-center p-4 bg-white shadow-sm z-50">
        <h1 className="text-2xl font-bold">Alfred Facture - Facturation simplifiée pour entrepreneurs</h1>
        <nav className="space-x-4">
          <Link
            href="/login"
            className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            Se connecter
          </Link>
        </nav>
      </header>

      <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-white text-gray-900 pt-24">

      <ul className="text-lg mb-8 text-left max-w-xl mx-auto space-y-2">
        <li className="flex items-start">
          <span className="mr-2">✅</span>
          <span>Générez vos factures automatiquement (PDF, TVA, mentions légales)</span>
        </li>
        <li className="flex items-start">
          <span className="mr-2">✅</span>
          <span>Suivez vos paiements</span>
        </li>
        <li className="flex items-start">
          <span className="mr-2">✅</span>
          <span>Restez conforme à la réglementation</span>
        </li>
        <li className="flex items-start">
          <span className="mr-2">✅</span>
          <span>Profitez d&apos;une interface claire et d&apos;une prise en main immédiate</span>
        </li>
      </ul>

        <h2 className="text-lg mb-2 text-center max-w-xl">
          Entrer votre email et profitez de 3 jours d’essai gratuit (sans engagement)
        </h2>

        <input
          type="email"
          placeholder="Votre email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md mb-4 w-64"
        />

        <button
          onClick={() => {
            if (!email) return alert("Veuillez entrer votre email pour démarrer l’essai.");
            localStorage.setItem('origin', 'demo')
            window.location.href = `/signup?email=${encodeURIComponent(email)}`;
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition cursor-pointer"
          >
            Commencer la démo
        </button>

        <ImageCarousel />


        {/* Offres */}
        <section className="mt-5 py-5 px-6 bg-gray-100 text-center rounded">
          <h2 className="text-2xl font-semibold mb-6">Offres disponibles</h2>
          <p className="text-lg mb-4">Choisissez la formule qui vous correspond le mieux.</p>
          <div className="flex justify-between items-center gap-8 mt-6 flex-wrap justify-center">
          {/* Offre Mensuelle */}
          <button 
            onClick={() => setSelectedPlan('monthly')}
            className={`cursor-pointer bg-white p-6 rounded-xl shadow-md w-72 border-2 transition ${
            selectedPlan === 'monthly' ? 'border-blue-600' : 'border-transparent'
          }`}>
            <h3 className="text-xl font-semibold mb-2">Mensuel</h3>
            <p className="text-2xl font-bold mb-4">9,99€/mois</p>
            <p className="text-gray-600">Sans engagement. Résiliable à tout moment.</p>
          </button>

          {/* Offre Annuelle */}
          <button
            onClick={() => setSelectedPlan('yearly')}
            className={`cursor-pointer bg-white p-6 rounded-xl shadow-md w-72 border-2 transition ${
            selectedPlan === 'yearly' ? 'border-blue-600' : 'border-transparent'
            }`}>
            <h3 className="text-xl font-semibold mb-2">Annuel</h3>
            <p className="text-2xl font-bold mb-4">99,90€/an</p>
            <p className="text-blue-600 font-medium">2 mois offerts</p>
            </button>
          </div>

          {/* Bouton d'inscription */}
          <div className='mt-10'>
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition cursor-pointer"
            >
              {loading ? 'Chargement...' : 'Démarrer en premium'}
            </button>
          </div>
        </section>

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

        <footer className="text-sm text-gray-600 text-center py-10 bg-white border-t">
          <p className="mb-2">
            <Link href="/legal/cgu" className="underline mr-4">CGU</Link>
            <Link href="/legal/politiqueConfidentialite" className="underline mr-4">Politique de confidentialité</Link>
            <Link href="/legal/mentionsLegales" className="underline">Mentions légales</Link>
          </p>
          <p>© {new Date().getFullYear()} Alfred Facture — Tous droits réservés.</p>
        </footer>
      </main>
    </div>
  )
}
