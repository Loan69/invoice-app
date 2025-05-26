'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Client } from "@/types/client";
import { useUser } from "@supabase/auth-helpers-react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type ClientFormProps = {
  mode: 'create' | 'edit';
  clientData?: Partial<Client>;  // Données initiales pour préremplir
  clientId?: string;      // Pour l’édition
  setIsDirty?: (v: boolean) => void;
};


export default function AddClientForm({ setIsDirty, clientData, mode, clientId }: ClientFormProps) {
  const supabase = createClientComponentClient()
  const user = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clientform, setClientForm] = useState<Partial<Client>>({
    first_name: clientData?.first_name || '',
  last_name: clientData?.last_name || '',
  siret: clientData?.siret || '',
  address: clientData?.address || '',
  email: clientData?.email || '',
  phone: clientData?.phone || '',
  company: clientData?.company || '',
  is_professional: clientData?.is_professional || false,
  });

  // Modification d'un champ
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target;
  
    setClientForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (setIsDirty) setIsDirty(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    if (!user) {
      console.error("Utilisateur non authentifié");
      return;
    }
    
    // Fusion du form avec l'id utilisateur
    const clientDataToInsert = {
      ...clientform,
      user_id: user.id,
    };
    
    if (mode === 'create') {
      const { error } = await supabase
        .from('clients')
        .insert([clientDataToInsert]);
    
      if (error) {
        console.error("Erreur création client :", error.message);
        return;
      }
    } else if (mode === 'edit' && clientId) {
      const { error } = await supabase
        .from('clients')
        .update(clientDataToInsert)
        .eq('id_int', clientId);
    
      if (error) {
        console.error("Erreur modification client :", error.message);
        return;
      }
    }
    
    setLoading(false);
  
    router.push('/dashboard');
  };
  

  return (
    <div className="flex justify-center p-8 items-start">
      {/* Formulaire d'ajout d'un client */}
      <form 
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg space-y-6 max-w-3xl w-full"
      >
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="is_professional"
            checked={clientform.is_professional}
            onChange={handleChange}
          />
          <span>Client professionnel</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            name="first_name"
            placeholder="Prénom"
            value={clientform.first_name}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            name="last_name"
            placeholder="Nom"
            value={clientform.last_name}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        {clientform.is_professional && (
          <>
            <input
              type="text"
              name="company"
              placeholder="Société"
              value={clientform.company}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="text"
              name="siret"
              placeholder="SIRET"
              value={clientform.siret}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </>
        )}

        <input
          type="text"
          name="address"
          placeholder="Adresse"
          value={clientform.address}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="mail"
          name="email"
          placeholder="Adresse mail"
          value={clientform.email}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="text"
          name="phone"
          placeholder="Téléphone"
          value={clientform.phone}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition duration-200 cursor-pointer"
        >
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>
    </div>
  );
}
