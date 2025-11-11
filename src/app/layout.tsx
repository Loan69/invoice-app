import './globals.css'
import { Providers } from './providers'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Alfred Facture',
  description: 'Logiciel de gestion et d\'édition de facture pour entrepreneurs',
  icons: {
    icon: '/images/Logo_app.png',
    apple: '/images/Logo_app.png',
  },
  manifest: '/images/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV
  
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/images/Logo_app.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/Logo_app.png" />
        <meta name="theme-color" content="#1d4ed8" />
      </head>
      <body>
        {appEnv === 'preprod' && (
          <div className="w-full bg-yellow-300 text-black text-center p-2 text-sm font-semibold animate-pulse">
            Environnement de PRÉPRODUCTION
          </div>
        )}
        {appEnv === 'development' && (
          <div className="w-full bg-green-600 text-black text-center p-2 text-sm font-semibold animate-pulse">
            Environnement de DÉVELOPPEMENT
          </div>
        )}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}