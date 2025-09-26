'use client';

import { useState } from 'react';
import Header from '../components/Header';
import Link from 'next/link';
import { supabase } from '@/app/lib/supabase';
import { useSearchParams } from 'next/navigation';

export default function SignupForm() {

  const searchParams = useSearchParams();
  const emailFromURL = searchParams.get('email') || '';
  const [email, setEmail] = useState(emailFromURL);

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Regarder si l'email est déjà associé à un compte
  const checkUserExists = async (email: string) => {
    const res = await fetch('/api/check-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    return data.exists;
  };
  
  // Fonction interne pour l'inscription dans supabase
  const handleSignup = async () => {
    setLoading(true);
    setMessage(null);
  
    try {
      // On vérifie si l'adresse mail n'existe pas déjà
      const exists = await checkUserExists(email);
  
      if (exists) {
        setMessage("Un compte existe déjà avec cette adresse email. Veuillez vous connecter.");
        setLoading(false);
        return;
      }
      
      // Enregistre l'adresse mail saisie
      localStorage.setItem("pendingEmail", email);
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/login` }
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
      <Header />
    
      <main className="max-w-sm mx-auto mt-20 space-y-4">
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
          <p className={`mt-4 text-center ${message.startsWith('Erreur') || message.startsWith('Un compte') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}

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
