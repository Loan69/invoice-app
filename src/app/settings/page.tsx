'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'
import SettingsForm from "@/app/components/SettingsForm"
import { ArrowLeft } from 'lucide-react'
import { Profile } from '@/types/profile'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Header from '../components/Header'

export default function SettingsPage() {
  const supabase = createClientComponentClient()
  const user = useUser()
  const router = useRouter()
  const [profileData, setProfileData] = useState<Partial<Profile>>({})
  const [isDirty, setIsDirty] = useState(false)
  const [loading, setLoading] = useState(false)

  // Affichage des informations de l'utilisateur
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

  // Résiliation de l'abonnement à l'appli
  const cancelSubscription = async () => {
    if (!user) return
  
    if (!confirm("Confirmez la résiliation de votre abonnement ?")) return
  
    setLoading(true)
  
    const res = await fetch("/api/cancel-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userEmail: user.email }),
    })
    const data = await res.json()
  
    if (!res.ok) {
      alert("Erreur : " + data.error)
      setLoading(false)
      return
    }
  
    // Update dans Supabase
    const { error } = await supabase
      .from("profiles")
      .update({
        abo_end_date: data.abo_end_date,
      })
      .eq("id", user.id)
  
    if (error) {
      console.error("Supabase error:", error.message)
      alert("Abonnement annulé sur Stripe, mais erreur côté Supabase")
    } else {
      alert("Résiliation confirmée. Accès jusqu'au " + new Date(data.abo_end_date).toLocaleString())
    }
  
    setLoading(false)
  }

  return (
    <div>
      <Header />
        <div className="flex justify-between items-center mt-10 ml-10 mr-10">
          <h1 className="text-3xl font-bold">Informations de votre compte</h1>
          <div className="flex gap-2">
            <button
              onClick={handleBack}
              className="cursor-pointer flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
            >
              <ArrowLeft size={18} />
              Retour
            </button>
            <button
              type="button"
              onClick={cancelSubscription}
              disabled={loading}
              className="cursor-pointer bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow"
            >
              {loading ? "Résiliation..." : "Résilier l’abonnement"}
            </button>
          </div>
        </div>
        <div className="max-w-xl mx-auto mt-5">
        <div className="space-y-4">
          <SettingsForm 
            profileData={profileData} 
            setIsDirty={setIsDirty}
          />
        </div>
      </div>
    </div>
  )
}
