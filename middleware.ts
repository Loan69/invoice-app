import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Hydrate la session utilisateur dans les cookies
  await supabase.auth.getSession()

  return res
}

export const config = {
  matcher: ['/dashboard/:path*'], // à adapter selon les routes que tu veux protéger
}
