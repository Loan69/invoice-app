'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import Link from 'next/link'
import Header from '../components/Header'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    else router.push('/dashboard')
  }

  return (
    <div>
      {/* Header avec logo */}
      <Header />
      
      <div className="max-w-sm mx-auto mt-20 space-y-4">
        <h1 className="text-2xl font-bold">Créer un compte</h1>
        {error && <p className="text-red-500">{error}</p>}
        <input
          className="w-full p-2 border rounded"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full p-2 border rounded"
          type="password"
          placeholder="Mot de passe"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="bg-black text-white px-4 py-2 rounded"
          onClick={handleSignup}
        >
          S'inscrire
        </button>

        {/* Redirection vers le formulaire de connexion si déjà un compte */}
        <p className="text-sm text-center mt-6">
            Vous avez déjà un compte ?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Connexion
            </Link>
          </p>
      </div>
    </div>
  )
}
