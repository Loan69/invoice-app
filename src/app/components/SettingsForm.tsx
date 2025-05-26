'use client'

import { useState, useEffect } from "react";
import { Profile } from "@/types/profile";
import { useUser } from "@supabase/auth-helpers-react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type ProfileFormProps = {
    profileData: Partial<Profile>;
    setIsDirty?: (v: boolean) => void;
};


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
        company: '',
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
            company: profileData.company || '',
          });
        }
      }, [profileData]);

    // Modification d'un champ
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, type, value, checked } = e.target;
      
        setProfileForm((prev) => ({
          ...prev,
          [name]: type === "checkbox" ? checked : value,
        }));
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
