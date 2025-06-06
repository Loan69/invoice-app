'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function ResetPasswordPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()

  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const hash = window.location.hash
    const params = new URLSearchParams(hash.substring(1))
    const access_token = params.get('access_token')
    const refresh_token = params.get('refresh_token')

    if (access_token && refresh_token) {
      setAccessToken(access_token)

      // 👇 Crée une session active AVANT de mettre à jour le mot de passe
      supabase.auth.setSession({
        access_token,
        refresh_token,
      })
    } else {
      setMessage('Token de réinitialisation manquant ou invalide.')
    }
  }, [])

  const handleUpdatePassword = async () => {
    if (!accessToken) {
      setMessage("Session non initialisée, impossible de changer le mot de passe.")
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setMessage("Erreur : " + error.message)
    } else {
      setMessage("Mot de passe mis à jour ! Redirection en cours...")
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
