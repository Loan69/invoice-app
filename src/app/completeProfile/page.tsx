'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import { Profile } from '@/types/profile';
import { User } from "@supabase/supabase-js";
import { useSupabase } from '../providers';

export default function CompleteProfilePage() {
  const { supabase } = useSupabase()
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [address, setAddress] = useState('');
  const [siret, setSiret] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [origin, setOrigin] = useState<string | null>(null);
  const [aboPlan, setAboPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Récupération de l'utilisateur
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error || !data?.user) {
          console.warn("Aucun utilisateur valide, redirection vers /signin");
          router.replace("/login");
          return;
        }

        setUser(data.user);
        console.log("Utilisateur connecté :", data.user);
      } catch (err) {
        console.error("Erreur récupération user :", err);
        router.replace("/login");
      }
    };

    fetchUser();
  }, [router, supabase]);

  useEffect(() => {
    const originStored = localStorage.getItem('origin')
    const aboPlanStored = localStorage.getItem('abo_plan')
    setOrigin(originStored)
    setAboPlan(aboPlanStored)
  }, [])

  useEffect(() => {
    if (!user) {
      supabase.auth.getUser().then(({ data }) => {
        if (!data.user) {
          router.push('/login');
        }
      });
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!user?.id) {
      setMessage('Utilisateur introuvable');
      return;
    }

    if (!firstName || !lastName) {
      setMessage('Le prénom et le nom sont obligatoires');
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const now = new Date();
    const demoExpiresAt = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);

    const profileData: Profile = {
      id: user.id,
      email: user.email,
      first_name: firstName,
      last_name: lastName,
      company: company,
      address: address,
      siret: siret,
      phone: phone,
      is_subscribed: false,
      abo_plan: aboPlan,
    }

    if (origin === 'demo') {
      profileData.is_demo = true
      profileData.demo_started_at = now.toISOString()
      profileData.demo_expires_at = demoExpiresAt.toISOString()
    } else if (origin === 'direct') {
      profileData.is_demo = false
      profileData.demo_started_at = null
      profileData.demo_expires_at = null
      profileData.is_subscribed = true
      profileData.subscription_started_at = now.toISOString()
    } else {
      profileData.is_demo = false
      profileData.is_subscribed = false
    }

    const { error } = await supabase.from('profiles').insert(profileData)

    setIsLoading(false);

    if (error) {
      setMessage("Erreur lors de l'enregistrement : " + error.message);
      return;
    }

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Complétez votre profil
            </h1>
            <p className="text-gray-600">
              Quelques informations pour personnaliser votre expérience
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8">
              <div className="space-y-6">
                {/* Informations personnelles */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold mr-3">1</span>
                    Informations personnelles
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Jean"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Dupont"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      placeholder="+33 6 12 34 56 78"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Informations professionnelles */}
                <div className="pt-6 border-t border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold mr-3">2</span>
                    Informations professionnelles
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Société
                      </label>
                      <input
                        type="text"
                        placeholder="Alfred SAS"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SIRET
                      </label>
                      <input
                        type="text"
                        placeholder="123 456 789 00012"
                        value={siret}
                        onChange={(e) => setSiret(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse
                      </label>
                      <textarea
                        placeholder="123 Rue de la République, 75001 Paris"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Message d'erreur */}
                {message && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
                    <svg className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-800">{message}</p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading || !firstName || !lastName}
                    className="cursor-pointer w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        Continuer
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </button>
                  <p className="text-center text-sm text-gray-500 mt-4">
                    <span className="text-red-500">*</span> Champs obligatoires
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info supplémentaire */}
          {origin === 'demo' && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-900">Période d'essai activée</p>
                <p className="text-sm text-blue-700 mt-1">Vous bénéficiez de 15 jours d'essai gratuit pour découvrir Alfred.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}