'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import SettingsForm from "@/app/components/SettingsForm"
import { ArrowLeft, Settings, AlertTriangle, User } from 'lucide-react'
import { Profile } from '@/types/profile'
import Header from '../components/Header'
import { useSupabase } from '../providers'
import { User as SupabaseUser } from '@supabase/supabase-js'

export default function SettingsPage() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profileData, setProfileData] = useState<Partial<Profile>>({})
  const [isDirty, setIsDirty] = useState(false)
  const [loading, setLoading] = useState(false)

  // Récupération de l'utilisateur
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
    }
    
    getUser()
  }, [supabase, router])

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
  }, [user, supabase])

  const handleBack = () => {
    if (isDirty) {
      const confirmLeave = confirm(
        "Des modifications non enregistrées seront perdues. Voulez-vous vraiment revenir au tableau de bord ?"
      )
      if (!confirmLeave) return
    }
    router.push('/dashboard')
  }

  // Résiliation de l'abonnement à l'appli
  const cancelSubscription = async () => {
    if (!user) return

    if (!confirm("Confirmez-vous la résiliation de votre abonnement ? Vous garderez l'accès jusqu'à la fin de votre période payée.")) return

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
      alert("Résiliation confirmée. Accès jusqu'au " + new Date(data.abo_end_date).toLocaleDateString('fr-FR'))
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex flex-col flex-row md:items-center md:justify-between sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
                <p className="text-sm text-gray-600 mt-1">Gérez les informations de votre compte</p>
              </div>
            </div>
            
            <button
              onClick={handleBack}
              className="cursor-pointer inline-flex items-center gap-2 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
            >
              <ArrowLeft size={20} />
              Retour au dashboard
            </button>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale - Formulaire */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b-2 border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  Informations du compte
                </h2>
              </div>
              
              <div className="p-6">
                <SettingsForm 
                  profileData={profileData} 
                  setIsDirty={setIsDirty}
                />
              </div>
            </div>
          </div>

          {/* Colonne latérale - Actions dangereuses */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 border-b-2 border-red-200">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Zone dangereuse
                </h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Résiliation de l'abonnement</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Vous pouvez annuler votre abonnement à tout moment. Vous conserverez l'accès jusqu'à la fin de votre période payée.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={cancelSubscription}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-red-200 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Résiliation en cours...
                      </span>
                    ) : (
                      "Résilier l'abonnement"
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    Cette action est irréversible pour la période en cours
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Alfred Facture. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  )
}