import AboSuccessClient from './aboSuccessClient'
import { Suspense } from 'react'

export default function AboSuccessPage() {
  return (
    <Suspense fallback={<p>Chargement...</p>}>
        <AboSuccessClient />
    </Suspense>
  )
}
