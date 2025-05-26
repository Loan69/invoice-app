'use client'

import { ArrowLeft } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useState } from "react";
import ClientForm from "@/app/components/ClientForm";
import { useUser } from '@supabase/auth-helpers-react';

export default function NewClientPage() {
  const user = useUser();
  const router = useRouter();
  const [isDirty, setIsDirty] = useState(false);

  const handleBack = () => {
    if (isDirty) {
      const confirmLeave = confirm(
        "Des modifications non enregistrées seront perdues. Voulez-vous vraiment revenir au tableau de bord ?"
      );
      if (!confirmLeave) return;
    }
    router.push('/dashboard');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen bg-gray-50">
      
      {/* Colonne gauche : Titre + Formulaire */}
      <div className="flex flex-col items-start justify-start p-8">
        <div className="flex justify-between w-full items-center mb-6">
          <h1 className="tml-10 text-3xl font-bold text-black mb-6">Ajouter un nouveau client</h1>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow cursor-pointer"
          >
            <ArrowLeft size={18} />
            Retour
          </button>
        </div>
        <ClientForm mode='create' setIsDirty={setIsDirty} />
      </div>

      {/* Colonne droite : Image */}
      <div 
        className="hidden md:block bg-cover bg-center"
        style={{ backgroundImage: 'url("/images/ClientForm_img.jpg")' }}
      > 
    </div>
    </div>
  );
}

