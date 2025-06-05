'use client'

import { useState, useEffect } from "react";
import { Profile } from "@/types/profile";
import { useUser } from "@supabase/auth-helpers-react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type ProfileFormProps = {
    profileData: Partial<Profile>;
    setIsDirty?: (v: boolean) => void;
};

const TVA_STATUTS = [
  { label: 'Taux normal (20%)', value: 'Normal' },
  { label: 'Taux réduit (10%)', value: 'Réduit' },
  { label: 'Taux super réduit (5.5%)', value: 'Super réduit' },
  { label: 'Taux particulier DOM (2.1%)', value: 'Particulier' },
];


export default function EditProfileForm({ setIsDirty, profileData }: ProfileFormProps) {
    const supabase = createClientComponentClient();
    const user = useUser();
    const [loading, setLoading] = useState(false);
    const [profileForm, setProfileForm] = useState({
        first_name: '',
        last_name: '',
        address: '',
        email: '',
        phone: '',
        vat_applicable: false,
        tax_status: 'Éxonéré',
        company: '',
        siret: '',
        rib: '',
      });
    const [successMessage, setSuccessMessage] = useState('');

    // Récupération des données utilisateurs pour préremplissage
    useEffect(() => {
        if (profileData) {
          setProfileForm({
            first_name: profileData.first_name || '',
            last_name: profileData.last_name || '',
            address: profileData.address || '',
            email: profileData.email || '',
            phone: profileData.phone || '',
            vat_applicable: profileData.vat_applicable ?? false,
            tax_status: profileData.vat_applicable ? (profileData.tax_status || '') : 'Exonéré',
            company: profileData.company || '',
            siret: profileData.siret || '',
            rib: profileData.rib || '',
          });
        }
      }, [profileData]);

    // Modification d'un champ
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, type, value, checked } = e.target;
      
        setProfileForm((prev) => {
          let updatedForm = {
              ...prev,
              [name]: type === "checkbox" ? checked : value,
          };
  
          // Si TVA décochée, on force le statut fiscal à Exonéré
          if (name === "vat_applicable" && !checked) {
              updatedForm.tax_status = "Exonéré";
          }
  
          return updatedForm;
      });
        if (setIsDirty) setIsDirty(true);
      };
      

    // Enregistrement des informations de l'utilisateur
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase
        .from('profiles')
        .update(profileForm)
        .eq('id', user?.id)
        .select();

        if (error) {
        console.error("Erreur modification du profil de l'utilisateur :", error.message);
        return;
        }
        
        setLoading(false);
        setSuccessMessage('Modifications enregistrées avec succès !');
        if (setIsDirty) setIsDirty(false);
    }
    

    return (
        <div className="flex justify-center p-8 items-start">
        {/* Formulaire d'édition des informations de l'utilisateur */}
        <form 
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-2xl shadow-lg space-y-6 max-w-3xl w-full"
        >
    
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                  type="text"
                  name="first_name"
                  placeholder="Prénom"
                  value={profileForm.first_name}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                  type="text"
                  name="last_name"
                  placeholder="Nom"
                  value={profileForm.last_name}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <input
              type="text"
              name="company"
              placeholder="Société"
              value={profileForm.company}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="text"
              name="siret"
              placeholder="SIRET"
              value={profileForm.siret}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="text"
              name="rib"
              placeholder="RIB"
              value={profileForm.rib}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="text"
              name="address"
              placeholder="Adresse"
              value={profileForm.address}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="mail"
              name="email"
              placeholder="Adresse mail"
              value={profileForm.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="text"
              name="phone"
              placeholder="Téléphone"
              value={profileForm.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <label className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  name="vat_applicable"
                  checked={profileForm.vat_applicable}
                  onChange={handleChange}
                />
                Appliquer la TVA sur mes factures
            </label>

            {/* Select conditionnel */}
            <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Statut fiscal</label>
                <Select
                  value={profileForm.tax_status}
                  onValueChange={(value) => {
                    // Ne pas autoriser de changement si désactivé
                    if (!profileForm.vat_applicable) return;

                    setProfileForm((prev) => ({ ...prev, tax_status: value }));
                    if (setIsDirty) setIsDirty(true);
                  }}
                  disabled={!profileForm.vat_applicable} // ← désactive le select si TVA décochée
                >
                  <SelectTrigger className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60">
                    <SelectValue placeholder="Sélectionner un statut fiscal" />
                  </SelectTrigger>
                  <SelectContent>
                    {TVA_STATUTS.map(({ label, value }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Message d'info UX si désactivé */}
                {!profileForm.vat_applicable && (
                  <p className="text-sm text-gray-500 mt-2 italic">
                    La TVA n’est pas appliquée : le statut fiscal est défini comme <strong>Exonéré</strong>.
                  </p>
                )}
            </div>

            {/* Message de succès d'enregistrement */}
            {successMessage && (
            <div className="text-green-600 font-medium">{successMessage}</div>
            )}

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
