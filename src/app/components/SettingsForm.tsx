'use client'

import { useState, useEffect } from "react";
import { Profile, BankDetails } from "@/types/profile";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSupabase } from "../providers";
import { User } from "@supabase/supabase-js";
import { CheckCircle, Upload, Trash2, Building, CreditCard, FileText } from "lucide-react";

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
    const { supabase } = useSupabase();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [profileForm, setProfileForm] = useState<Partial<Profile>>({
        first_name: '',
        last_name: '',
        address: '',
        email: '',
        phone: '',
        vat_applicable: false,
        tax_status: 'Exonéré',
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

    // Récupération de l'utilisateur
    useEffect(() => {
      const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      };
      getUser();
    }, [supabase]);

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
    
          if (name === "vat_applicable" && !checked) {
            updatedForm.tax_status = "Exonéré";
          }
        }
    
        return updatedForm;
      });
    
      if (setIsDirty) setIsDirty(true);
    };

    // Insertion ou modification du logo
    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !user?.id) return;
    
      const fileName = `logo-${user.id}`;
    
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type,
          cacheControl: 'public, max-age=0',
        });
    
      if (uploadError) {
        console.error('Erreur lors de l\'upload :', uploadError.message);
        return;
      }
    
      const {
        data: { publicUrl },
      } = supabase.storage.from('logos').getPublicUrl(fileName);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ logo_url: publicUrl })
        .eq('id', user.id);
    
      if (updateError) {
        console.error('Erreur mise à jour logo_url :', updateError.message);
        return;
      }

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
          console.error("Erreur modification du profil :", error.message);
          setLoading(false);
          return;
        }
        
        setLoading(false);
        setSuccessMessage('Modifications enregistrées avec succès !');
        if (setIsDirty) setIsDirty(false);
        
        setTimeout(() => setSuccessMessage(''), 3000);
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type d'abonnement */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
          <span className="text-sm font-semibold text-gray-700">Type d&apos;abonnement</span>
          {profileForm.abo_plan ? (
            <span className={`px-4 py-2 rounded-lg text-white text-sm font-semibold ${
              profileForm.abo_plan === "yearly" ? "bg-gradient-to-r from-green-500 to-green-600" : "bg-gradient-to-r from-blue-500 to-blue-600"
            }`}>
              {profileForm.abo_plan === "yearly" ? "Abonnement annuel" : "Abonnement mensuel"}
            </span>
          ) : (
            <span className="text-gray-500 text-sm">Non renseigné</span>
          )}
        </div>

        {/* Informations personnelles */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Building className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-gray-900">Informations personnelles</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
              <input
                type="text"
                name="first_name"
                placeholder="Prénom"
                value={profileForm.first_name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
              <input
                type="text"
                name="last_name"
                placeholder="Nom"
                value={profileForm.last_name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Société</label>
            <input
              type="text"
              name="company"
              placeholder="Nom de votre société"
              value={profileForm.company}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SIRET</label>
            <input
              type="text"
              name="siret"
              placeholder="Numéro SIRET"
              value={profileForm.siret}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
            <input
              type="text"
              name="address"
              placeholder="Adresse complète"
              value={profileForm.address}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Adresse email"
              value={profileForm.email}
              onChange={handleChange}
              disabled
              className="w-full p-3 bg-gray-100 border border-gray-300 rounded-xl cursor-not-allowed text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">L&apos;email ne peut pas être modifié</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
            <input
              type="text"
              name="phone"
              placeholder="Numéro de téléphone"
              value={profileForm.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Coordonnées bancaires */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-gray-900">Coordonnées bancaires</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">IBAN</label>
            <input
              type="text"
              name="bank_details.iban"
              placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
              value={profileForm.bank_details?.iban}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">BIC</label>
            <input
              type="text"
              name="bank_details.bic"
              placeholder="BNPAFRPPXXX"
              value={profileForm.bank_details?.bic}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la banque</label>
            <input
              type="text"
              name="bank_details.bank_name"
              placeholder="Ex: BNP Paribas"
              value={profileForm.bank_details?.bank_name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Logo */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-gray-900">Logo de votre société</h3>
          </div>

          <div className="flex items-center gap-4">
            <label
              htmlFor="logo-upload"
              className="inline-flex items-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 rounded-xl shadow-sm text-sm text-gray-700 font-medium cursor-pointer hover:bg-gray-50 hover:border-indigo-300 transition-all"
            >
              <Upload className="w-4 h-4" />
              Choisir un fichier
            </label>
            <span className="text-sm text-gray-500">
              {profileForm.logo_url ? "Logo enregistré" : "Aucun fichier"}
            </span>
          </div>

          <input
            id="logo-upload"
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />

          {profileForm.logo_url && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-3">Aperçu du logo</p>
              <div className="flex items-center gap-4">
                <img
                  src={`${profileForm.logo_url}?v=${Date.now()}`}
                  alt="Logo entreprise"
                  className="h-20 max-w-xs object-contain border border-gray-200 rounded-lg p-2 bg-white"
                />
                <button
                  type="button"
                  onClick={async () => {
                    const { error } = await supabase.storage
                      .from("logos")
                      .remove([`logo-${user?.id}`]);

                    if (!error) {
                      setProfileForm((prev) => ({ ...prev, logo_url: '' }));
                      if (setIsDirty) setIsDirty(true);
                    } else {
                      console.error("Erreur suppression logo:", error);
                      alert("Erreur lors de la suppression du logo.");
                    }
                  }}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-all font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            </div>
          )}
        </div>

        {/* TVA */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-all">
            <input
              type="checkbox"
              name="vat_applicable"
              checked={profileForm.vat_applicable}
              onChange={handleChange}
              className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="font-medium text-gray-900">Appliquer la TVA sur mes factures</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut fiscal</label>
            <Select
              value={profileForm.tax_status}
              onValueChange={(value) => {
                if (!profileForm.vat_applicable) return;
                setProfileForm((prev) => ({ ...prev, tax_status: value }));
                if (setIsDirty) setIsDirty(true);
              }}
              disabled={!profileForm.vat_applicable}
            >
              <SelectTrigger className="w-full border-2 border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed">
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

            {!profileForm.vat_applicable && (
              <p className="text-sm text-gray-500 mt-2 italic">
                La TVA n&apos;est pas appliquée : le statut fiscal est défini comme <strong>Exonéré</strong>.
              </p>
            )}
          </div>
        </div>

        {/* Message de succès */}
        {successMessage && (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">{successMessage}</span>
          </div>
        )}

        {/* Bouton submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white py-4 px-6 rounded-xl font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enregistrement...
            </span>
          ) : (
            'Enregistrer les modifications'
          )}
        </button>
      </form>
    );
}