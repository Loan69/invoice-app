'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import LoadingSpinner from '../components/LoadingSpinner';
import { useUser } from '@supabase/auth-helpers-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AboSuccessClient() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailFromUrl = searchParams.get('email')
  const user = useUser()
  const [origin, setOrigin] = useState<string | null>(null)

  useEffect(() => {
    // Lecture de localStorage uniquement côté client
    if (typeof window !== 'undefined') {
      const storedOrigin = localStorage.getItem('origin')
      setOrigin(storedOrigin)
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
