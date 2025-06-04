'use client';

import { useState } from 'react';
import Header from '../components/Header';
import Link from 'next/link';
import { supabase } from '@/app/lib/supabase';

export default function SignupPage() {

  // États pour inputs et messages
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Fonction interne pour l'inscription dans supabase
  const handleSignup = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
        },
      });

      if (error) {
        setMessage(`Erreur lors de la création du compte : ${error.message}`);
      } else {
        setMessage("Compte créé. Vérifiez votre email pour confirmer.");
      }

    } catch (err) {
      console.error(err);
      setMessage("Erreur inattendue.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSignup();
  };

  return (
    <div>
      {/* Header avec logo */}
      <Header />
    
      <main className="max-w-sm mx-auto mt-20 space-y-4">
        {/* Formulaire d'inscription */}
        <h1 className="text-2xl font-bold mb-6">Créer un compte</h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border rounded p-2"
          />

          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border rounded p-2"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded cursor-pointer"
          >
            {loading ? 'Création...' : 'Créer le compte'}
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-center ${message.startsWith('Erreur') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}

        {/* Redirection si déjà un compte */}
        <p className="text-sm text-center mt-6">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Connexion
          </Link>
        </p>

      </main>
    </div>
  );
}
