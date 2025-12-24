import Script from 'next/script'
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
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV
  
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/images/Logo_app.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/Logo_app.png" />
        <meta name="theme-color" content="#1d4ed8" />
        <meta name="google-site-verification" content="c8f0_D3ksUBL7YXv8ZKOl4tjPwT3DDndusITr6czme0" />
        <Script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Alfred Facture",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "9.50",
                "priceCurrency": "EUR"
              },
              "description": "Logiciel de facturation simple pour auto-entrepreneurs et artisans. Créez factures et devis en 3 minutes."
            })
          }}
        />
      </head>
      <body>
        {/* Google tag (gtag.js) */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-ZL9MCY2K63"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-ZL9MCY2K63');
            `,
          }}
        />
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