'use client'

import { useEffect, useState } from 'react'
import Header from '../components/Header'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'


export default function AbonnementExpirePage() {
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly')
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // Récupération de l'adresse de l'utilisateur
  useEffect( () => {
    const getUserEmail = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        setUserEmail(user?.email ?? null)
      }
  
      getUserEmail()
    }, [])

  const handleSubscribe = async () => {

    setLoading(true)
    try {
      localStorage.setItem('origin', 'aboExpire')
      localStorage.setItem('abo_plan', selectedPlan);
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail, plan: selectedPlan }),
      })

      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Erreur lors de la redirection.')
      }
    } catch (error) {
      console.error(error)
      alert('Erreur lors de la création de la session.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
        <Header />
        <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-gray-900">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-xl w-full text-center">
            <h1 className="text-3xl font-bold mb-4 text-blue-600">Votre période d’essai est terminée</h1>
            <p className="text-gray-700 mb-6">
            Pour continuer à utiliser Alfred Facture, veuillez choisir une formule d’abonnement.
            </p>

            {/* Plans */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
            <button
                onClick={() => setSelectedPlan('monthly')}
                className={`cursor-pointer  w-full sm:w-1/2 px-6 py-4 rounded-lg border-2 transition text-left
                ${selectedPlan === 'monthly' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'}`}
            >
                <h3 className="text-lg font-semibold">Mensuel</h3>
                <p className="text-2xl font-bold">9,99 € / mois</p>
                <p className="text-sm text-gray-500">Sans engagement</p>
            </button>

            <button
                onClick={() => setSelectedPlan('yearly')}
                className={`cursor-pointer w-full sm:w-1/2 px-6 py-4 rounded-lg border-2 transition text-left
                ${selectedPlan === 'yearly' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'}`}
            >
                <h3 className="text-lg font-semibold">Annuel</h3>
                <p className="text-2xl font-bold">99,90 € / an</p>
                <p className="text-sm text-blue-600">2 mois offerts</p>
            </button>
            </div>

            {/* CTA */}
            <button
            onClick={handleSubscribe}
            disabled={loading}
            className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition w-full"
            >
            {loading ? 'Redirection en cours...' : 'Souscrire à cette offre'}
            </button>

            <p className="text-sm text-gray-500 mt-6">
            Vous serez redirigé vers Stripe pour compléter le paiement.
            </p>
        </div>
        </main>
    </div>
  )
}
