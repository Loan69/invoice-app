import './globals.css'
import { AuthProvider } from './context/AuthContext'

export const metadata = {
  title: 'Mon App',
  description: 'Logiciel de gestion et d&apos;édition de facture pour entreprenneurs',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
