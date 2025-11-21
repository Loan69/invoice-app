'use client'

import { useRouter } from 'next/navigation'
import { useSupabase } from '../providers'

export default function LogoutButton() {
  const router = useRouter()
  const { supabase } = useSupabase()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button 
        onClick={handleLogout}
        className="bg-white text-sm py-2 px-4
        rounded-lg transition-colors duration-200 shadow cursor-pointer"
    >
      Se déconnecter
    </button>
  )
}
