import type { Metadata } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://cxradar.com'),
  title: 'CXRadar — Identifique clientes em risco antes que cancelem',
  description: 'Plataforma de Customer Experience Intelligence. Transforme feedback em decisões e monitore a saúde da sua base de clientes em tempo real.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'CXRadar — Identifique clientes em risco antes que cancelem',
    description: 'Transforme NPS, CSAT e CES em inteligência acionável. Veja quem está em risco de cancelar antes que seja tarde.',
    url: 'https://cxradar.com',
    siteName: 'CXRadar',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CXRadar — Identifique clientes em risco antes que cancelem',
    description: 'Transforme NPS, CSAT e CES em inteligência acionável.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://cxradar.com/#organization',
      name: 'CXRadar',
      url: 'https://cxradar.com',
      description: 'Plataforma de Customer Experience Intelligence para identificar clientes em risco de cancelamento.',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'sales',
        availableLanguage: 'Portuguese',
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://cxradar.com/#website',
      url: 'https://cxradar.com',
      name: 'CXRadar',
      publisher: { '@id': 'https://cxradar.com/#organization' },
      inLanguage: 'pt-BR',
    },
    {
      '@type': 'SoftwareApplication',
      name: 'CXRadar',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'Plataforma SaaS de Customer Experience Intelligence. NPS, CSAT e CES em um único dashboard com alertas de churn preditivo.',
      offers: {
        '@type': 'Offer',
        priceCurrency: 'BRL',
      },
      publisher: { '@id': 'https://cxradar.com/#organization' },
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  )
}
