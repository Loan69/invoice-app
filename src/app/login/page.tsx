'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import Link from 'next/link'
import Header from '../components/Header'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else router.push('/dashboard')
  }

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) router.push('/dashboard')
    }
    check()
  }, [router])
  

  return (
    <div>
      {/* Header avec logo */}
      <Header />
      
      <div className="max-w-sm mx-auto mt-20 space-y-4">

        {/* Formulaire de connexion */}
        <h1 className="text-2xl font-bold">Connexion</h1>
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
          className="bg-black text-white px-4 py-2 rounded cursor-pointer"
          onClick={handleLogin}
        >
          Se connecter
        </button>

        <p className="text-sm text-center mt-6">
          Vous n’avez pas de compte ?{" "}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  )
}
