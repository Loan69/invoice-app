import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'Mon App',
  description: 'Logiciel de gestion et d&apos;édition de facture pour entrepreneurs',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
