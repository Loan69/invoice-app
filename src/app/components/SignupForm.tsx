'use client';

import { useState } from 'react';
import Header from '../components/Header';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { UserPlus, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useSupabase } from '../providers';

export default function SignupForm() {
  const { supabase } = useSupabase();
  const searchParams = useSearchParams();
  const emailFromURL = searchParams.get('email') || '';
  
  const [email, setEmail] = useState(emailFromURL);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'error' | 'success'>('error');

  // Fonction de traduction des erreurs Supabase
  const translateError = (error: string): string => {
    const errorTranslations: { [key: string]: string } = {
      'User already registered': 'Un compte existe déjà avec cette adresse email',
      'Invalid email': 'Adresse email invalide',
      'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères',
      'Unable to validate email address: invalid format': 'Format d\'email invalide',
      'Email rate limit exceeded': 'Trop de tentatives, veuillez réessayer plus tard',
      'Signup requires a valid password': 'Veuillez entrer un mot de passe valide',
    };

    return errorTranslations[error] || 'Une erreur est survenue, veuillez réessayer';
  };

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
        setMessageType('error');
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
        setMessage(translateError(error.message));
        setMessageType('error');
      } else {
        setMessage("Compte créé avec succès ! Vérifiez votre boîte email pour confirmer votre adresse.");
        setMessageType('success');
      }
    } catch (err) {
      console.error(err);
      setMessage("Erreur inattendue lors de la création du compte.");
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };  

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSignup();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSubmit(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      <div className="flex items-center justify-center px-4 py-8 sm:py-12 lg:py-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* En-tête avec dégradé */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full px-5 backdrop-blur-sm mb-6">
                <UserPlus className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-3">Créer un compte</h1>
              <p className="text-indigo-100">Rejoignez Alfred Facture dès aujourd&apos;hui</p>
            </div>

            {/* Corps du formulaire */}
            <div className="px-8 py-10">
              <form onSubmit={onSubmit} className="space-y-6">
                {/* Champ Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                    Adresse email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      className="block w-full pl-11 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 text-base"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                  </div>
                </div>

                {/* Champ Mot de passe */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      className="block w-full pl-11 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 text-base"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Minimum 6 caractères
                  </p>
                </div>

                {/* Message d'erreur/succès */}
                {message && (
                  <div className={`flex items-start gap-3 p-4 rounded-xl ${
                    messageType === 'error' 
                      ? 'bg-red-50 border border-red-200' 
                      : 'bg-green-50 border border-green-200'
                  }`}>
                    <div className="flex-shrink-0 pt-0.5">
                      {messageType === 'error' ? (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <p className={`text-sm font-medium ${
                      messageType === 'error' ? 'text-red-800' : 'text-green-800'
                    }`}>
                      {message}
                    </p>
                  </div>
                )}

                {/* Bouton de création */}
                <button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer w-full mt-8 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-4 px-6 rounded-xl font-semibold text-base hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Création en cours...
                    </span>
                  ) : (
                    'Créer mon compte'
                  )}
                </button>

                {/* Séparateur */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Déjà un compte ?</span>
                  </div>
                </div>

                {/* Lien vers connexion */}
                <div className="text-center">
                  <Link href="/login" className="inline-flex items-center justify-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors hover:underline">
                    Se connecter à mon compte
                  </Link>
                </div>
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Alfred Facture. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}