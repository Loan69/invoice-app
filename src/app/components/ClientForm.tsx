'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

type ClientFormProps = {
  mode: 'create' | 'edit';
  clientData?: any;       // Données initiales pour préremplir
  clientId?: string;      // Pour l’édition
  setIsDirty?: (v: boolean) => void;
};


export default function AddClientForm({ setIsDirty, clientData, mode, clientId }: ClientFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clientform, setClientForm] = useState({
    first_name: clientData?.first_name || '',
    last_name: clientData?.last_name || '',
    siret: clientData?.siret || '',
    address: clientData?.address || '',
    email: clientData?.email || '',
    phone: clientData?.phone || '',
    company: clientData?.company || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClientForm(prev => ({ ...prev, [name]: value }));
    if (setIsDirty) setIsDirty(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    if (mode === 'create') {
      const { error } = await supabase.from('clients').insert([clientform]);
      if (error) {
        console.error("Erreur création client :", error.message);
        return;
      }
    } else if (mode === 'edit' && clientId) {
      const { error } = await supabase
        .from('clients')
        .update(clientform)
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
