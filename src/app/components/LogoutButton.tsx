'use client'

import { supabase } from "../lib/supabase"
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button 
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4
        rounded-lg transition-colors duration-200 shadow cursor-pointer"
    >
      Se déconnecter
    </button>
  )
}
