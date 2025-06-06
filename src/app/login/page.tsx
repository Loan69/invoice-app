'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import Header from '../components/Header'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';


export default function LoginPage() {
  const supabase = createClientComponentClient();
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter()

  useEffect(() => {
    const email = localStorage.getItem("pendingEmail");
    if (email) {
      setEmail(email);
      localStorage.removeItem("pendingEmail"); // Optionnel
    }
  }, []);
  
  

  const handleLogin = async () => {
    const { data: loginData, error } = await supabase.auth.signInWithPassword({ email, password });


    if (error || !loginData.user) {
      setMessage('Connexion échouée : ' + error?.message);
      return;
    }

    const userId = loginData.user.id;

    // Vérifier si un profil existe dans la table profiles
    const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();

    if (profileError || !profile) {
      // Si ce n'est pas le cas, on dirige vers la page de complétion du profil
      router.push('/completeProfile');
    } else {
      // Sinon, on dirige vers le dashboard de l'utilisateur
      router.push('/dashboard');
    }

  };

  return (
    <div>
      {/* Header avec logo */}
      <Header />
      
      <div className="max-w-sm mx-auto mt-20 space-y-4">

        {/* Formulaire de connexion */}
        <h1 className="text-2xl font-bold">Connexion</h1>
        <input
          className="w-full p-2 border rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full p-2 border rounded"
          type="password"
          placeholder="Mot de passe"
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className='flex justify-between'>
          {/*Bouton de connexion */}
          <button
            onClick={handleLogin}
            className="bg-black text-white px-4 py-2 rounded cursor-pointer"
          >
            Se connecter
          </button>

          {/* Réinitialisation du mot de passe */}
          {/* Désactivé pour le moment
          <Link
            href='/forgotPassword'
          >
            <p className="text-sm text-blue-600 hover:underline">
              Mot de passe oublié ?
            </p>
          </Link>*/}
        </div>

        {/* Message d'erreur s'il y en a un */}
        {message && <p className="mt-1 text-center text-red-600">{message}</p>}

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
