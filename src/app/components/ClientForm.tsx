'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Client } from "@/types/client";
import { useSupabase } from "../providers";
import { User } from "@supabase/supabase-js";
import { useEffect } from "react";
import { User as UserIcon, Building, Mail, Phone, MapPin, FileText, CheckCircle } from "lucide-react";

type ClientFormProps = {
  mode: 'create' | 'edit';
  clientData?: Partial<Client>;
  clientId?: string;
  setIsDirty?: (v: boolean) => void;
};

export default function AddClientForm({ setIsDirty, clientData, mode, clientId }: ClientFormProps) {
  const { supabase } = useSupabase();
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
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

  // Récupération de l'utilisateur
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
    };
    getUser();
  }, [supabase, router]);

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
      setLoading(false);
      return;
    }
    
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
        setLoading(false);
        return;
      }
    } else if (mode === 'edit' && clientId) {
      const { error } = await supabase
        .from('clients')
        .update(clientDataToInsert)
        .eq('id_int', clientId);
    
      if (error) {
        console.error("Erreur modification client :", error.message);
        setLoading(false);
        return;
      }
    }
    
    setSuccessMessage(mode === 'create' ? 'Client créé avec succès !' : 'Client modifié avec succès !');
    setLoading(false);

    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };

  return (
    <div className="p-1 items-start w-full">
      <form 
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-xl border-0 space-y-6 max-w-3xl w-full"
      >
        {/* Type de client */}
        <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border-2 border-indigo-200">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="is_professional"
              checked={clientform.is_professional}
              onChange={handleChange}
              className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-indigo-600" />
              <span className="font-semibold text-gray-900">Client professionnel</span>
            </div>
          </label>
        </div>

        {/* Informations personnelles */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <UserIcon className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-gray-900">Informations personnelles</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prénom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="first_name"
                placeholder="Prénom"
                value={clientform.first_name}
                onChange={handleChange}
                required
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="last_name"
                placeholder="Nom"
                value={clientform.last_name}
                onChange={handleChange}
                required
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Informations professionnelles (si client pro) */}
        {clientform.is_professional && (
          <div className="space-y-4 pt-4 border-t-2 border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Building className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-gray-900">Informations de l&apos;entreprise</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Société
              </label>
              <input
                type="text"
                name="company"
                placeholder="Nom de la société"
                value={clientform.company}
                onChange={handleChange}
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SIRET
              </label>
              <input
                type="text"
                name="siret"
                placeholder="Numéro SIRET"
                value={clientform.siret}
                onChange={handleChange}
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        )}

        {/* Coordonnées */}
        <div className="space-y-4 pt-4 border-t-2 border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-gray-900">Coordonnées</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1 text-gray-500" />
              Adresse
            </label>
            <input
              type="text"
              name="address"
              placeholder="Adresse complète"
              value={clientform.address}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1 text-gray-500" />
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="adresse@email.com"
              value={clientform.email}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-1 text-gray-500" />
              Téléphone
            </label>
            <input
              type="text"
              name="phone"
              placeholder="06 12 34 56 78"
              value={clientform.phone}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Message de succès */}
        {successMessage && (
          <div className="flex items-center gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-sm font-medium text-green-800">{successMessage}</span>
          </div>
        )}

        {/* Bouton submit */}
        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white py-4 px-6 rounded-xl font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {mode === 'create' ? 'Création...' : 'Modification...'}
            </span>
          ) : (
            mode === 'create' ? 'Créer le client' : 'Modifier le client'
          )}
        </button>
      </form>
    </div>
  );
}