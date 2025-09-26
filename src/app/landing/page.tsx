'use client'

import { useState } from 'react'
import Link from 'next/link'
import ImageCarousel from '../components/ImageCarousel'
import Image from 'next/image'

export default function LandingPage() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly')

  const handleSubscribe = async () => {
    if (!email) {
      alert('Veuillez entrer votre email avant de choisir une offre.')
      return
    }

    setLoading(true)
    try {
      localStorage.setItem('origin', 'direct')
      localStorage.setItem('abo_plan', selectedPlan)
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
      {/* Header */}
      <header 
        className="fixed top-0 right-0 left-0 flex flex-col md:flex-row md:justify-between md:items-center p-4 bg-gradient-to-r from-blue-700 to-indigo-700 shadow-md shadow-sm z-50">
        <div className='mx-auto flex gap-2 max-w-6xl items-center px-6 py-3'>
          <div className="flex h-15 w-30 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Image
                src="/images/Logo_app.png"
                alt="Invoice App Logo"
                width={100}
                height={100}
                className="object-contain"
              />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white text-center md:text-left mb-2 md:mb-0">
            Alfred-Facture
            <span className="block md:inline md:ml-2 text-sm md:text-base font-normal text-gray-300">
              Facturation simplifiée pour entrepreneurs
            </span>
          </h1>
        </div>
        <nav className="flex justify-center md:justify-end">
          <Link
            href="/login"
            className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition text-sm md:text-base"
          >
            Se connecter
          </Link>
        </nav>
      </header>


      <main className="min-h-screen flex flex-col items-center justify-center px-4 md:px-6 bg-white text-gray-900 pt-24">
        {/* Avantages */}
        <ul className="text-base md:text-lg mb-8 text-left max-w-xl mx-auto space-y-3 md:space-y-2">
          <li className="flex items-start">
            <span className="mr-2">✅</span>
            <span>Générez vos factures automatiquement (PDF, TVA, mentions légales)</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✅</span>
            <span>Créez et éditez vos devis puis transformez-les en facture</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✅</span>
            <span>Suivez vos paiements et relances</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✅</span>
            <span>Restez conforme à la réglementation</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✅</span>
            <span>Interface claire et prise en main immédiate</span>
          </li>
        </ul>

        {/* Call to action */}
        <h2 className="text-base md:text-lg mb-2 text-center max-w-xl font-medium">
          Entrez votre email et profitez de 15 jours d’essai gratuit (sans engagement)
        </h2>

        <input
          type="email"
          placeholder="Votre email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md mb-4 w-full max-w-xs"
        />

        <button
          onClick={() => {
            if (!email) return alert("Veuillez entrer votre email pour démarrer l’essai.")
            localStorage.setItem('origin', 'demo')
            window.location.href = `/signup?email=${encodeURIComponent(email)}`
          }}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition cursor-pointer w-full max-w-xs"
        >
          Commencer la démo
        </button>

        {/* Carousel d’images */}
        <div className="w-full mt-10 max-w-4xl">
          <ImageCarousel />
        </div>

        {/* Offres */}
        <section className="mt-10 py-6 px-4 md:px-6 bg-gray-100 text-center rounded w-full">
          <h2 className="text-xl md:text-2xl font-semibold mb-6">Offres disponibles</h2>
          <p className="text-base md:text-lg mb-4">Choisissez la formule qui vous correspond le mieux.</p>

          <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-8 mt-6">
            {/* Mensuel */}
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={`cursor-pointer bg-white p-6 rounded-xl shadow-md w-full max-w-xs border-2 transition ${
                selectedPlan === 'monthly' ? 'border-blue-600' : 'border-transparent'
              }`}
            >
              <h3 className="text-lg md:text-xl font-semibold mb-2">Mensuel</h3>
              <p className="text-xl md:text-2xl font-bold mb-4">9,50€/mois</p>
              <p className="text-gray-600 text-sm md:text-base">Sans engagement. Résiliable à tout moment.</p>
            </button>

            {/* Annuel */}
            <button
              onClick={() => setSelectedPlan('yearly')}
              className={`cursor-pointer bg-white p-6 rounded-xl shadow-md w-full max-w-xs border-2 transition ${
                selectedPlan === 'yearly' ? 'border-blue-600' : 'border-transparent'
              }`}
            >
              <h3 className="text-lg md:text-xl font-semibold mb-2">Annuel</h3>
              <p className="text-xl md:text-2xl font-bold mb-4">95,00€/an</p>
              <p className="text-blue-600 font-medium text-sm md:text-base">2 mois offerts</p>
            </button>
          </div>

          {/* Bouton abonnement */}
          <div className="mt-10">
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition cursor-pointer w-full max-w-xs"
            >
              {loading ? 'Chargement...' : 'Démarrer en premium'}
            </button>
          </div>
        </section>

        {/* Témoignages */}
        <section className="py-20 px-4 md:px-6 bg-white">
          <h2 className="text-xl md:text-2xl font-semibold text-center mb-10">Ils en parlent mieux que nous</h2>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
              <p className="italic">&quot;Enfin un outil simple et efficace pour gérer mes factures et devis.&quot;</p>
              <p className="mt-4 font-semibold">— Julien, graphiste freelance</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
              <p className="italic">&quot;J&apos;ai pu envoyer ma première facture en 5 minutes. Interface claire et rapide.&quot;</p>
              <p className="mt-4 font-semibold">— Marie, consultante</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
              <p className="italic">&quot;Service client réactif, et la génération PDF est parfaite. Top !&quot;</p>
              <p className="mt-4 font-semibold">— Samuel, développeur indépendant</p>
            </div>
          </div>
        </section>

        {/* Footer */}
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
