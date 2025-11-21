'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft } from "lucide-react";
import ClientForm from '@/app/components/ClientForm';
import { Client } from '@/types/client';
import { User } from '@supabase/auth-helpers-react';
import { useSupabase } from '@/app/providers';

export default function EditClientPage() {
  const { supabase } = useSupabase();
  const [user, setUser] = useState<User | null>(null);
  const { id } = useParams();
  const [clientData, setClientData] = useState<Client | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const router = useRouter();

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
    if (!user || !id) return;
    const fetchClient = async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id_int', id)
        .eq('user_id', user?.id)
        .single();

      

      if (error) console.error(error.message);
      else setClientData(data);
    };

    if (id) fetchClient();
  }, [id, user?.id, supabase]);

  const returnToDashboard = () => {
    if (isDirty) {
      const confirmLeave = confirm(
        "Des modifications non enregistrées seront perdues. Voulez-vous vraiment revenir au tableau de bord ?"
      );
      if (!confirmLeave) return;
    }
    router.push("/dashboard");
  };

  return clientData ? (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen bg-gray-50">
      {/* Colonne gauche : Titre + Formulaire */}
      <div className="flex flex-col items-start justify-start p-8">
        <div className="flex justify-between w-full items-center mb-6">
          <h1 className="text-2xl font-bold text-black">
            Edition de la fiche client #{id}
          </h1>
          <button
              onClick={returnToDashboard}
              className="cursor-pointer inline-flex items-center gap-2 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
            >
              <ArrowLeft size={20} />
              Retour au dashboard
            </button>
        </div>
        <ClientForm
          mode="edit"
          clientId={id as string}
          clientData={clientData}
          setIsDirty={setIsDirty}
        />
      </div>
      {/* Colonne droite : Image */}
      <div
      className="hidden md:block bg-cover bg-center"
      style={{ backgroundImage: 'url("/images/ClientForm_img.jpg")' }}
    />
    </div>
  ) : (
    <p>Chargement...</p>
  );
}
