import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/toaster'
import { CartProvider } from '@/hooks/use-cart'
import { LanguageProvider } from '@/hooks/use-language'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Firsty Shop',
  description: "Plateforme d'affiliation gagnant-gagnant entre marchands et clients.\nLes clients recommandent, gagnent des commissions ; les marchands vendent plus.\nInscrivez-vous, partagez, gagnez !",
  generator: "Firsty Shop",
  icons: {
    icon: "/firsty.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <LanguageProvider>
          <CartProvider>
            {children}
            <Toaster />
          </CartProvider>
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  )
}
