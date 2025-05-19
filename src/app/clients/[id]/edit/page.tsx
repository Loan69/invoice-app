'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import { ArrowLeft } from "lucide-react";
import ClientForm from '@/app/components/ClientForm';
import { Client } from '@/types/client';

export default function EditClientPage() {
  const { id } = useParams();
  const [clientData, setClientData] = useState<Client | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchClient = async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id_int', id)
        .single();
      if (error) console.error(error.message);
      else setClientData(data);
    };

    if (id) fetchClient();
  }, [id]);

  const handleBack = () => {
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
          <h1 className="text-3xl font-bold text-black mb-6">
            Edition de la fiche client #{id}
          </h1>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow cursor-pointer"
          >
            <ArrowLeft size={18} />
            Retour
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
