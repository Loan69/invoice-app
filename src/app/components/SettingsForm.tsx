'use client'

import { useState, useEffect } from "react";
import { Profile, BankDetails } from "@/types/profile";
import { useUser } from "@supabase/auth-helpers-react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SupabaseClient } from '@supabase/supabase-js';


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
        bank_details: {
          iban: '',
          bic: '',
          bank_name: '',
        },
        abo_plan: '',
        logo_url:'',
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
            bank_details: {
              iban: profileData.bank_details?.iban || '',
              bic: profileData.bank_details?.bic || '',
              bank_name: profileData.bank_details?.bank_name || '',
            },
            abo_plan: profileData.abo_plan || '',
            logo_url: profileData.logo_url || '',
          });
        }
      }, [profileData]);

    // Modification d'un champ
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, type, value, checked } = e.target;
    
      // Vérifie si le nom du champ contient un point (ex: "bank_details.bic")
      const isNested = name.includes(".");
    
      setProfileForm((prev) => {
        let updatedForm = { ...prev };
    
        if (isNested) {
          const [parentKey, childKey] = name.split(".") as ["bank_details", keyof BankDetails];
    
          if (parentKey === "bank_details") {
            updatedForm = {
              ...prev,
              bank_details: {
                ...(prev.bank_details ?? {}),
                [childKey]: value,
              },
            };
          }
        } else {
          updatedForm = {
            ...prev,
            [name]: type === "checkbox" ? checked : value,
          };
    
          // Si TVA décochée, alors on force le statut fiscal à "Exonéré"
          if (name === "vat_applicable" && !checked) {
            updatedForm.tax_status = "Exonéré";
          }
        }
    
        return updatedForm;
      });
    
      if (setIsDirty) setIsDirty(true);
    };

    // Insertion ou modification du logo
    const handleLogoUpload = async (
      e: React.ChangeEvent<HTMLInputElement>,
      userId: string,
      supabase: SupabaseClient,
      setProfileForm: (fn: (prev: any) => any) => void,
      setIsDirty?: (dirty: boolean) => void
    ) => {
      const file = e.target.files?.[0];
      if (!file || !userId) return;
    
      const fileName = `logo-${userId}.png`;
    
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type,
          cacheControl: 'public, max-age=0',
        });
    
      if (uploadError) {
        console.error('Erreur lors de l’upload :', uploadError.message);
        return;
      }
    
      const {
        data: { publicUrl },
      } = supabase.storage.from('logos').getPublicUrl(fileName);
      
      // Mise à jour du champ logo_url dans Supabase
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ logo_url: publicUrl })
        .eq('id', userId);
    
      if (updateError) {
        console.error('Erreur mise à jour logo_url :', updateError.message);
        return;
      }
      // Mise à jour locale du state
      setProfileForm((prev) => ({ ...prev, logo_url: publicUrl }));
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
          <div className="flex justify-between">
            <label className="block text-sm font-medium text-gray-700 mb-1">Type d&apos;abonnement : </label>
              {profileForm.abo_plan ? (
              <span
                className={`px-2 py-1 rounded text-white text-sm ${
                  profileForm.abo_plan === "yearly" ? "bg-green-600" : "bg-blue-600"
                }`}
              >
                {profileForm.abo_plan === "yearly" ? "Abonnement annuel" : "Abonnement mensuel"}
              </span>
            ) : (
              <span className="text-gray-500">Non renseigné</span>
            )}
          </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
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

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Coordonnées bancaires</label>
              <input
                type="text"
                name="bank_details.iban"
                placeholder="IBAN"
                value={profileForm.bank_details.iban}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <input
                type="text"
                name="bank_details.bic"
                placeholder="BIC"
                value={profileForm.bank_details.bic}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <input
                type="text"
                name="bank_details.bank_name"
                placeholder="Nom de la banque"
                value={profileForm.bank_details.bank_name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

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
              disabled
              className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
            />

            <input
              type="text"
              name="phone"
              placeholder="Téléphone"
              value={profileForm.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="mt-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">Logo de votre société</label>
              <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (user?.id) {
                      handleLogoUpload(e, user.id, supabase, setProfileForm, setIsDirty);
                    }
                  }}
                />

              {profileForm.logo_url && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-1">Aperçu :</p>
                  <img src={`${profileForm.logo_url}?v=${Date.now()}`} alt="Logo entreprise" className="h-20 object-contain border rounded" />
                </div>
              )}
            </div>


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
