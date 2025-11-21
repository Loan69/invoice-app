'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '../components/Header'
import { useSupabase } from '../providers'
import { LogIn, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react'

export default function LoginPage() {
  const { supabase } = useSupabase();
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'error' | 'success'>('error');
  const [isLoading, setIsLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetMessageType, setResetMessageType] = useState<'error' | 'success'>('error');
  const router = useRouter()

  // Fonction de traduction des erreurs Supabase
  const translateError = (error: string): string => {
    const errorTranslations: { [key: string]: string } = {
      'Invalid login credentials': 'Email ou mot de passe incorrect',
      'Email not confirmed': 'Veuillez confirmer votre email avant de vous connecter',
      'User not found': 'Aucun compte associé à cet email',
      'Invalid email': 'Adresse email invalide',
      'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères',
      'Unable to validate email address: invalid format': 'Format d\'email invalide',
      'Email rate limit exceeded': 'Trop de tentatives, veuillez réessayer plus tard',
      'User already registered': 'Un compte existe déjà avec cet email',
      'Signup requires a valid password': 'Veuillez entrer un mot de passe valide',
      'For security purposes, you can only request this once every 60 seconds': 'Veuillez patienter 60 secondes avant de réessayer',
    };

    return errorTranslations[error] || 'Une erreur est survenue, veuillez réessayer';
  };

  useEffect(() => {
    const email = localStorage.getItem("pendingEmail");
    if (email) {
      setEmail(email);
      localStorage.removeItem("pendingEmail");
    }
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    setMessage(null);

    const { data: loginData, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error || !loginData.user) {
      setMessage(translateError(error?.message || 'Invalid login credentials'));
      setMessageType('error');
      setIsLoading(false);
      return;
    }

    const userId = loginData.user.id;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      router.push('/completeProfile');
    } else {
      if (profile.is_demo && profile.demo_started_at) {
        const now = new Date();
        if (now > profile.demo_expires_at) {
          await supabase
            .from('profiles')
            .update({ is_demo: false })
            .eq('id', userId);
        }
      }
      router.push('/dashboard');
    }
    setIsLoading(false);
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      setResetMessage('Veuillez entrer votre adresse email');
      setResetMessageType('error');
      return;
    }

    setIsLoading(true);
    setResetMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/resetPassword`,
    });

    if (error) {
      setResetMessage(translateError(error.message));
      setResetMessageType('error');
    } else {
      setResetMessage('Un email de réinitialisation a été envoyé ! Vérifiez votre boîte de réception.');
      setResetMessageType('success');
      setTimeout(() => {
        setShowResetPassword(false);
        setResetMessage(null);
        setResetEmail('');
      }, 4000);
    }
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (showResetPassword) {
        handleResetPassword();
      } else {
        handleLogin();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      <div className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {!showResetPassword ? (
            // Formulaire de connexion
            <div className="bg-white rounded-2xl shadow-2xl border-0 overflow-hidden">
              {/* En-tête avec dégradé */}
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm mb-4">
                  <LogIn className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Bienvenue</h1>
                <p className="text-indigo-100 text-sm">Connectez-vous à votre compte</p>
              </div>

              {/* Formulaire */}
              <div className="px-8 py-10 space-y-6">
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
                </div>

                {/* Lien mot de passe oublié */}
                <div className="flex items-center justify-end -mt-2">
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(true)}
                    className="cursor-pointer text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors hover:underline"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>

                {/* Message d'erreur/succès */}
                {message && (
                  <div className={`flex items-start gap-3 p-4 rounded-xl ${
                    messageType === 'error' 
                      ? 'bg-red-50 text-red-800 border border-red-200' 
                      : 'bg-green-50 text-green-800 border border-green-200'
                  }`}>
                    <div className="flex-shrink-0 mt-0.5">
                      {messageType === 'error' ? (
                        <AlertCircle className="w-5 h-5" />
                      ) : (
                        <CheckCircle className="w-5 h-5" />
                      )}
                    </div>
                    <p className="text-sm font-medium leading-relaxed">{message}</p>
                  </div>
                )}

                {/* Bouton de connexion */}
                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-4 px-4 rounded-xl font-semibold text-base hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-8"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Connexion en cours...
                    </span>
                  ) : (
                    'Se connecter'
                  )}
                </button>

                {/* Lien vers inscription */}
                <div className="text-center pt-6 border-t border-gray-200 mt-8">
                  <p className="text-sm text-gray-600">
                    Vous n&apos;avez pas de compte ?{' '}
                    <Link href="/signup" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors hover:underline">
                      Créer un compte
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Formulaire de réinitialisation de mot de passe
            <div className="bg-white rounded-2xl shadow-2xl border-0 overflow-hidden">
              {/* En-tête */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm mb-4">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Mot de passe oublié</h1>
                <p className="text-orange-100 text-sm">Réinitialisez votre mot de passe</p>
              </div>

              {/* Formulaire */}
              <div className="px-8 py-10 space-y-6">
                <p className="text-sm text-gray-600 text-center leading-relaxed">
                  Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>

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
                      className="block w-full pl-11 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 text-base"
                      placeholder="votre@email.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                  </div>
                </div>

                {/* Message */}
                {resetMessage && (
                  <div className={`flex items-start gap-3 p-4 rounded-xl ${
                    resetMessageType === 'error'
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-green-50 text-green-800 border border-green-200'
                  }`}>
                    <div className="flex-shrink-0 mt-0.5">
                      {resetMessageType === 'error' ? (
                        <AlertCircle className="w-5 h-5" />
                      ) : (
                        <CheckCircle className="w-5 h-5" />
                      )}
                    </div>
                    <p className="text-sm font-medium leading-relaxed">{resetMessage}</p>
                  </div>
                )}

                {/* Boutons */}
                <div className="space-y-3 pt-4">
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 px-4 rounded-xl font-semibold text-base hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Envoi en cours...
                      </span>
                    ) : (
                      'Envoyer le lien de réinitialisation'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowResetPassword(false);
                      setResetMessage(null);
                      setResetEmail('');
                    }}
                    disabled={isLoading}
                    className="w-full bg-white border-2 border-gray-300 text-gray-700 py-4 px-4 rounded-xl font-semibold text-base hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Retour à la connexion
                  </button>
                </div>
              </div>
            </div>
          )}

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