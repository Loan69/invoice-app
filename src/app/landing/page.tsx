'use client'

import { useState } from 'react'

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
    </main>
  )
}
