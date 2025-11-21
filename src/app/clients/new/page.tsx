'use client'

import { ArrowLeft } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useState } from "react";
import ClientForm from "@/app/components/ClientForm";

export default function NewClientPage() {
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
          <h1 className="tml-10 text-2xl font-bold text-black">Ajouter un nouveau client</h1>
          <button
            onClick={handleBack}
            className="cursor-pointer inline-flex items-center gap-2 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
          >
            <ArrowLeft size={20} />
            Retour au dashboard
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

