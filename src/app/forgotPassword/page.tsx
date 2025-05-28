'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function ForgotPasswordPage() {
  const supabase = createClientComponentClient()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/resetPassword`
    })

    if (error) {
      setMessage("Erreur : " + error.message)
    } else {
      setMessage("Un lien vous a été envoyé pour réinitialiser votre mot de passe.")
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-4 border rounded">
      <h1 className="text-xl mb-4">Réinitialisation de votre mot de passe</h1>
      <input
        type="email"
        placeholder="Votre adresse email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border p-2 mb-4"
      />
      <button onClick={handleReset} className="bg-blue-600 text-white px-4 py-2 cursor-pointer">
        Réinitialiser
      </button>
      {message && <p className="mt-4">{message}</p>}
    </div>
  )
}
