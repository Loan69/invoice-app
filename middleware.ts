// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  // Création de la réponse NextResponse pour poursuivre le flux
  const res = NextResponse.next()
  
  // Crée le client Supabase côté middleware, qui va utiliser les cookies de la requête
  const supabase = createMiddlewareClient({ req, res })

  // Récupère la session de l'utilisateur depuis Supabase (s'il est connecté)
  const { data: { session } } = await supabase.auth.getSession()
  
  // Si une session est présente, l'utilisateur est connecté
  if (session?.user) {
    // On récupère le profil de l'utilisateur
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, abo_end_date, is_subscribed")
      .eq("id", session.user.id)
      .single()

    if (!error && profile) {
      // Si le profil possède une date de fin d'abonnement
      if (profile.abo_end_date) {
        // Convertit la date enregistrée en objet Date
        const aboEndDate = new Date(profile.abo_end_date)
        const now = new Date()
        
        // Vérifie si la date d'échéance est passée et si l'utilisateur est toujours considéré comme abonné
        if (aboEndDate.getTime() < now.getTime() && profile.is_subscribed) {
          // Met à jour le profil de l'utilisateur pour désactiver son abonnement
          await supabase
            .from("profiles")
            .update({ is_subscribed: false,
                      abo_plan: null })
            .eq("id", session.user.id)
        }
      }
    }
  }
  
  // Retourne la réponse modifiée (si besoin) ou la réponse d'origine
  return res
}

// On applique ce middleware sur les routes protégées (exemple : tout ce qui commence par /dashboard)
export const config = {
  matcher: ["/dashboard/:path*"],
}
