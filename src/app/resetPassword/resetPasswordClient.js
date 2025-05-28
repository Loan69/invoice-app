'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function ResetPasswordClient() {
  const supabase = createClientComponentClient()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  // Récupérer l'access_token dans l'URL
  const accessToken = searchParams.get('access_token')

  // Dès que la page charge, on tente d'établir la session à partir du token (optionnel)
  useEffect(() => {
    if (!accessToken) {
      setMessage('Token de réinitialisation manquant ou invalide.')
    } else {
      // Optionnel : on peut essayer de stocker ce token en session
      // supabase.auth.setSession({ access_token: accessToken })  // pas dispo côté client dans cette lib
      // Normalement pas nécessaire, supabase gère ça automatiquement si le token est dans l'URL
    }
  }, [accessToken])

  const handleUpdatePassword = async () => {
    if (!accessToken) {
      setMessage('Token manquant, impossible de mettre à jour le mot de passe.')
      return
    }

    setLoading(true)

    // Cette fonction utilise le token pour changer le mot de passe sans être connecté
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setMessage("Erreur : " + error.message)
    } else {
      setMessage("Mot de passe mis à jour. Redirection en cours...")
      setTimeout(() => router.push('/dashboard'), 2000)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-4 border rounded">
      <h1 className="text-xl mb-4">Définir un nouveau mot de passe</h1>
      <input
        type="password"
        placeholder="Nouveau mot de passe"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="w-full border p-2 mb-4"
      />
      <button
        onClick={handleUpdatePassword}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2"
      >
        {loading ? "Mise à jour..." : "Valider"}
      </button>
      {message && <p className="mt-4">{message}</p>}
    </div>
  )
}
