'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'
import SettingsForm from "@/app/components/SettingsForm"
import { ArrowLeft } from 'lucide-react'
import { Profile } from '@/types/profile'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function SettingsPage() {
  const supabase = createClientComponentClient()
  const user = useUser()
  const router = useRouter()
  const [profileData, setProfileData] = useState<Partial<Profile>>({})
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!user) return

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (data) {
        setProfileData(data)
      } else {
        console.error("Erreur chargement profil", error)
      }
    }

    fetchProfile()
  }, [user])

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
    <div className="max-w-xl mx-auto mt-10">
       <div className="flex justify-between w-full items-center mb-6">
        <h1 className="space-y-4 text-2xl font-bold mb-4">Informations de votre compte</h1>
        <button
              onClick={handleBack}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow cursor-pointer"
            >
              <ArrowLeft size={18} />
              Retour
            </button>
        </div>
      <div className="space-y-4">
        <SettingsForm 
          profileData={profileData} 
          setIsDirty={setIsDirty}
        />
      </div>
    </div>
  )
}
