'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import LoadingSpinner from '../components/LoadingSpinner';
import { User } from "@supabase/supabase-js";
import { useSupabase } from '../providers';

export default function AboSuccessClient() {
  const { supabase } = useSupabase()
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailFromUrl = searchParams.get('email')
  const [origin, setOrigin] = useState<string | null>(null)
  const [aboPlan, setAboPlan] = useState<string | null>(null)

  // Récupération de l'utilisateur
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error || !data?.user) {
          console.warn("Aucun utilisateur valide, redirection vers /login");
          router.replace("/login");
          return;
        }

        setUser(data.user);
      } catch (err) {
        console.error("Erreur récupération user :", err);
        router.replace("/login");
      }
    };

    fetchUser();
  }, [router, supabase]);

  useEffect(() => {
    // Lecture de localStorage uniquement côté client
    if (typeof window !== 'undefined') {
      const storedOrigin = localStorage.getItem('origin')
      const storedAboPlan = localStorage.getItem('abo_plan')
      setOrigin(storedOrigin)
      setAboPlan(storedAboPlan)
    }
  }, [])

  useEffect(() => {
    if (!origin) return // Ne rien faire tant que origin est null

    const updateProfile = async () => {
      if (origin === 'demo' || origin === 'direct') {
        router.replace(`/signup?success=true&email=${encodeURIComponent(emailFromUrl || '')}`)
        
      } else if (origin === 'aboExpire') {
        if (!user) return // Ne rien faire tant que user est null
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            is_subscribed: true,
            is_demo: false,
            subscription_started_at: new Date().toISOString(),
            abo_plan: aboPlan,
            abo_end_date: null,
          })
          .eq('id', user.id)

        if (updateError) {
          console.error('Erreur mise à jour profil :', updateError)
          return
        }

        router.replace('/dashboard')
      } else {
        router.replace('/') // fallback
      }
    }

    updateProfile()
  }, [origin, user, emailFromUrl, router])

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg font-semibold">Finalisation de l’abonnement...</p>
      <LoadingSpinner />
    </div>
  )
}
