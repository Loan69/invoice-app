import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'Mon App',
  description: 'Logiciel de gestion et d&apos;édition de facture pour entrepreneurs',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV

  return (
    <html lang="fr">
      <body>
      {appEnv === 'preprod' && (
          <div className="w-full bg-yellow-600 text-black text-center p-2 text-sm font-semibold animate-pulse">
            Environnement de PRÉPRODUCTION
          </div>
        )}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
