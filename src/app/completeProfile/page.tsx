'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { useUser } from '@supabase/auth-helpers-react';
import Header from '../components/Header';
import { Profile } from '@/types/profile';


export default function CompleteProfilePage() {
  const supabaseClient = supabase;
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [address, setAddress] = useState('');
  const [siret, setSiret] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [origin, setOrigin] = useState<string | null>(null)

  const user = useUser();

  useEffect(() => {
    const originStored = localStorage.getItem('origin')  // 'demo' ou 'direct' ou null
    setOrigin(originStored)
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

    const now = new Date();
    const demoExpiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // Ajoute 3 jours

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
    }

    if (origin === 'demo') {
      // Utilisateur en période d'essai demo
      profileData.is_demo = true
      profileData.demo_started_at = now.toISOString()
      profileData.demo_expires_at = demoExpiresAt.toISOString()
    } else if (origin === 'direct') {
      // Utilisateur qui vient de l'abonnement payant
      profileData.is_demo = false
      profileData.demo_started_at = ''
      profileData.demo_expires_at = ''
      profileData.is_subscribed = true
      profileData.subscription_started_at = now.toISOString()
    } else {
      // Cas par défaut (pas de démo, pas abonné)
      profileData.is_demo = false
      profileData.is_subscribed = false
    }

    const { error } = await supabaseClient.from('profiles').insert(profileData)


    if (error) {
      setMessage("Erreur lors de l'enregistrement : " + error.message);
      return;
    }

    router.push('/dashboard');
  };

  return (
    <div>
      <Header />
      <main className="max-w-md mx-auto mt-10 p-4">
        <h1 className="text-2xl font-bold mb-6 text-center">Complétez votre profil</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="bg-white p-8 rounded-2xl shadow-lg space-y-6 max-w-3xl w-full"
        >
          <input
            type="text"
            placeholder="Prénom"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full border rounded p-2"
          />
          <input
            type="text"
            placeholder="Nom"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full border rounded p-2"
          />
          <input
            type="text"
            placeholder="Société (optionnel)"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full border rounded p-2"
          />
          <input
            type="text"
            placeholder="Siret (optionnel)"
            value={siret}
            onChange={(e) => setSiret(e.target.value)}
            className="w-full border rounded p-2"
          />
          <input
            type="text"
            placeholder="Adresse (optionnel)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border rounded p-2"
          />
          <input
            type="text"
            placeholder="Téléphone (optionnel)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border rounded p-2"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 cursor-pointer"
          >
            Enregistrer
          </button>
        </form>
        {message && <p className="mt-4 text-center text-red-600">{message}</p>}
      </main>
    </div>
  );
}
