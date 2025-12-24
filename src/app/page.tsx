'use client'

import { useState } from 'react'
import Link from 'next/link'
import ImageCarousel from './components/ImageCarousel'
import Image from 'next/image'

export default function Home() {
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
    <div className="bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="fixed top-0 right-0 left-0 bg-white/95 backdrop-blur-md shadow-sm z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
                <Image
                  src="/Logo_app.png"
                  alt="Alfred Facture Logo"
                  width={32}
                  height={32}
                  className="object-contain sm:w-10 sm:h-10"
                />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900">Alfred Facture</h1>
                <p className="text-xs text-slate-600 hidden sm:block">Facturation simplifiée</p>
              </div>
            </div>
            <Link
              href="/login"
              className="px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
            >
              Connexion
            </Link>
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-16 sm:h-20"></div>

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="pt-8 sm:pt-16 pb-12 sm:pb-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-slate-900 mb-4 sm:mb-6 leading-tight px-2">
              La facturation <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">simplifiée</span> pour entrepreneurs
            </h2>
            
            <p className="text-base sm:text-xl text-slate-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Créez vos factures et devis en quelques clics. Gagnez du temps et restez conforme à la législation.
            </p>

            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-blue-50 text-blue-700 text-xs sm:text-sm font-medium mb-4 sm:mb-5 border border-blue-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              15 jours d&apos;essai gratuit
            </div>

            {/* Email CTA */}
            <div className="max-w-md mx-auto px-4">
              <div className="flex flex-col sm:justify-center gap-3">
                <input
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-5 py-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors sm:text-lg"
                />
                <button
                  onClick={() => {
                    if (!email) return alert("Veuillez entrer votre email pour démarrer l'essai.")
                    localStorage.setItem('origin', 'demo')
                    window.location.href = `/signup?email=${encodeURIComponent(email)}`
                  }}
                  className="cursor-pointer px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 whitespace-nowrap"
                >
                  Commencer gratuitement
                </button>
              </div>
              <p className="text-sm text-slate-500 mt-3">Sans engagement • Sans carte bancaire</p>
            </div>
          </div>
        </section>

        {/* Section prix */}
        <section className="py-12 sm:py-20 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8 sm:mb-12 px-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
                Tarifs transparents
              </h2>
              <p className="text-base sm:text-xl text-slate-600">
                Choisissez la formule adaptée à vos besoins
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
              {/* Plan Mensuel */}
              <div
                onClick={() => setSelectedPlan('monthly')}
                className={`cursor-pointer p-6 sm:p-8 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl ${
                  selectedPlan === 'monthly'
                    ? 'border-blue-600 bg-blue-50 shadow-lg sm:scale-105'
                    : 'border-slate-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="flex justify-between items-start mb-4 sm:mb-6">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1 sm:mb-2">Mensuel</h3>
                    <p className="text-sm sm:text-base text-slate-600">Flexibilité maximale</p>
                  </div>
                  {selectedPlan === 'monthly' && (
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs sm:text-sm">✓</span>
                    </div>
                  )}
                </div>
                
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-bold text-slate-900">9,50€</span>
                    <span className="text-sm sm:text-base text-slate-600">/mois</span>
                  </div>
                </div>

                <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  <li className="flex items-start gap-2 text-sm sm:text-base text-slate-700">
                    <span className="text-green-500 mt-0.5 sm:mt-1 flex-shrink-0">✓</span>
                    <span>Sans engagement</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm sm:text-base text-slate-700">
                    <span className="text-green-500 mt-0.5 sm:mt-1 flex-shrink-0">✓</span>
                    <span>Résiliable à tout moment</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm sm:text-base text-slate-700">
                    <span className="text-green-500 mt-0.5 sm:mt-1 flex-shrink-0">✓</span>
                    <span>Toutes les fonctionnalités</span>
                  </li>
                </ul>
              </div>

              {/* Plan Annuel */}
              <div
                onClick={() => setSelectedPlan('yearly')}
                className={`cursor-pointer p-6 sm:p-8 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl relative ${
                  selectedPlan === 'yearly'
                    ? 'border-blue-600 bg-blue-50 shadow-lg sm:scale-105'
                    : 'border-slate-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="absolute -top-3 sm:-top-4 right-4 sm:right-6 px-3 sm:px-4 py-0.5 sm:py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs sm:text-sm font-bold rounded-full shadow-lg">
                  2 MOIS OFFERTS
                </div>

                <div className="flex justify-between items-start mb-4 sm:mb-6 mt-2">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1 sm:mb-2">Annuel</h3>
                    <p className="text-sm sm:text-base text-slate-600">Meilleur rapport qualité/prix</p>
                  </div>
                  {selectedPlan === 'yearly' && (
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs sm:text-sm">✓</span>
                    </div>
                  )}
                </div>
                
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-bold text-slate-900">95€</span>
                    <span className="text-sm sm:text-base text-slate-600">/an</span>
                  </div>
                  <p className="text-xs sm:text-sm text-green-600 font-medium mt-2">
                    Soit 7,92€/mois • Économisez 19€
                  </p>
                </div>

                <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  <li className="flex items-start gap-2 text-sm sm:text-base text-slate-700">
                    <span className="text-green-500 mt-0.5 sm:mt-1 flex-shrink-0">✓</span>
                    <span>Sans engagement</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm sm:text-base text-slate-700">
                    <span className="text-green-500 mt-0.5 sm:mt-1 flex-shrink-0">✓</span>
                    <span>17% d&apos;économie</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm sm:text-base text-slate-700">
                    <span className="text-green-500 mt-0.5 sm:mt-1 flex-shrink-0">✓</span>
                    <span>Toutes les fonctionnalités</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center mt-8 sm:mt-12 px-4">
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="cursor-pointer w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-base sm:text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Chargement...' : 'Démarrer en premium'}
              </button>
              <p className="text-xs sm:text-sm text-slate-500 mt-3 sm:mt-4">15 jours d&apos;essai gratuit inclus</p>
            </div>
          </div>
        </section>

        {/* Fonctionnalités */}
        <section className="py-12 sm:py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 px-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
                Pourquoi choisir Alfred Facture ?
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="group p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-600 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-xl sm:text-2xl">📄</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3">Factures automatiques</h3>
                <p className="text-sm sm:text-base text-slate-600">Générez vos factures en PDF avec TVA et mentions légales conformes</p>
              </div>

              <div className="group p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-600 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-xl sm:text-2xl">✏️</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3">Devis professionnels</h3>
                <p className="text-sm sm:text-base text-slate-600">Créez et transformez vos devis en factures en un clic</p>
              </div>

              <div className="group p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-600 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-xl sm:text-2xl">💰</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3">Suivi des paiements</h3>
                <p className="text-sm sm:text-base text-slate-600">Suivez vos paiements et relances clients en temps réel</p>
              </div>

              <div className="group p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-orange-600 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-xl sm:text-2xl">⚖️</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3">100% conforme</h3>
                <p className="text-sm sm:text-base text-slate-600">Respectez la réglementation française automatiquement</p>
              </div>

              <div className="group p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-cyan-600 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-xl sm:text-2xl">⚡</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3">Interface intuitive</h3>
                <p className="text-sm sm:text-base text-slate-600">Prise en main immédiate, aucune formation nécessaire</p>
              </div>

              <div className="group p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-yellow-600 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-xl sm:text-2xl">🚀</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3">Gain de temps</h3>
                <p className="text-sm sm:text-base text-slate-600">Créez votre première facture en moins de 3 minutes</p>
              </div>
            </div>
          </div>
        </section>

        {/* Carousel Section */}
        <section className="py-12 sm:py-20 px-4 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-slate-900 mb-3 sm:mb-4 px-4">
              Découvrez l&apos;interface
            </h2>
            <p className="text-base sm:text-xl text-slate-600 text-center mb-8 sm:mb-12 px-4">
              Une application pensée pour les entrepreneurs
            </p>
            <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-xl sm:shadow-2xl">
              <ImageCarousel />
            </div>
          </div>
        </section>

        {/* Témoignages */}
        <section className="py-12 sm:py-20 px-4 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-slate-900 mb-3 sm:mb-4 px-4">
              Ils nous font confiance
            </h2>
            <p className="text-base sm:text-xl text-slate-600 text-center mb-8 sm:mb-12 px-4">
              Rejoignez des entrepreneurs satisfaits
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-slate-100">
                <div className="flex gap-0.5 sm:gap-1 mb-3 sm:mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg sm:text-xl">★</span>
                  ))}
                </div>
                <p className="text-sm sm:text-base text-slate-700 mb-4 sm:mb-6 italic leading-relaxed">
                  &quot;Enfin un outil simple et efficace pour gérer mes factures et devis. Je recommande à tous les freelances !&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white font-bold flex-shrink-0 text-sm sm:text-base">
                    J
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm sm:text-base">Julien M.</p>
                    <p className="text-xs sm:text-sm text-slate-600">Graphiste freelance</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-slate-100">
                <div className="flex gap-0.5 sm:gap-1 mb-3 sm:mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg sm:text-xl">★</span>
                  ))}
                </div>
                <p className="text-sm sm:text-base text-slate-700 mb-4 sm:mb-6 italic leading-relaxed">
                  &quot;J&apos;ai créé ma première facture en 3 minutes. L&apos;interface est claire et intuitive, parfait pour les débutants.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold flex-shrink-0 text-sm sm:text-base">
                    M
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm sm:text-base">Marie L.</p>
                    <p className="text-xs sm:text-sm text-slate-600">Consultante</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-slate-100">
                <div className="flex gap-0.5 sm:gap-1 mb-3 sm:mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg sm:text-xl">★</span>
                  ))}
                </div>
                <p className="text-sm sm:text-base text-slate-700 mb-4 sm:mb-6 italic leading-relaxed">
                  &quot;Service client réactif et génération PDF impeccable. Exactement ce que je cherchais. Merci Alfred !&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center text-white font-bold flex-shrink-0 text-sm sm:text-base">
                    S
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm sm:text-base">Samuel D.</p>
                    <p className="text-xs sm:text-sm text-slate-600">Développeur indépendant</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 sm:py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-4 sm:mb-6 px-4">
              Prêt à simplifier votre facturation ?
            </h2>
            <p className="text-base sm:text-xl text-blue-100 mb-8 sm:mb-10 px-4">
              Rejoignez Alfred Facture et concentrez-vous sur l&apos;essentiel : votre activité
            </p>
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="cursor-pointer w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 bg-white text-blue-600 text-base sm:text-lg font-semibold rounded-xl hover:bg-slate-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 mx-4 sm:mx-0"
            >
              Commencer gratuitement
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-400 py-8 sm:py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                  <Image
                    src="/Logo_app.png"
                    alt="Alfred Facture"
                    width={20}
                    height={20}
                    className="object-contain sm:w-6 sm:h-6"
                  />
                </div>
                <span className="text-white font-semibold text-sm sm:text-base">Alfred Facture</span>
              </div>
              
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
                <Link href="/legal/cgu" className="hover:text-white transition">
                  CGU
                </Link>
                <Link href="/legal/politiqueConfidentialite" className="hover:text-white transition">
                  Confidentialité
                </Link>
                <Link href="/legal/mentionsLegales" className="hover:text-white transition">
                  Mentions légales
                </Link>
              </div>
            </div>
            
            <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-slate-800 text-center text-xs sm:text-sm">
              <p>© {new Date().getFullYear()} Alfred Facture — Tous droits réservés.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
