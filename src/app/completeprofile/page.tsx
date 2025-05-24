'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase'; // ou le bon chemin vers ton client supabase
import { useUser } from '@supabase/auth-helpers-react';

export default function CompleteProfilePage() {
  const supabaseClient = supabase;
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const user = useUser();

  useEffect(() => {
  }, []);

  const handleSubmit = async () => {
    if (!user?.id) {
      setMessage('Utilisateur introuvable');
      return;
    }

    const { error } = await supabaseClient.from('profiles').insert({
      id: user.id,
      email: user.email,
      first_name: firstName,
      last_name: lastName,
      company: company,
      address: address,
    });

    if (error) {
      setMessage("Erreur lors de l'enregistrement : " + error.message);
      return;
    }

    router.push('/dashboard');
  };

  return (
    <main className="max-w-md mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Complétez votre profil</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="space-y-4"
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
          placeholder="Adresse (optionnel)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border rounded p-2"
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
        >
          Enregistrer
        </button>
      </form>
      {message && <p className="mt-4 text-center text-red-600">{message}</p>}
    </main>
  );
}
