import ResetPasswordClient from './ResetPasswordClient'
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense fallback={<p>Chargement...</p>}>
      <ResetPasswordClient />
    </Suspense>
  )
}
