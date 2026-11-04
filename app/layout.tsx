import type { Metadata } from 'next';
import './globals.scss';
import Navbar from '@/components/navigation/Navbar';
import ScrollManager from '@/components/common/ScrollManager';
import BackgroundShader from '@/components/common/BackgroundShader';

export const metadata: Metadata = {
  metadataBase: new URL('https://ankitrajmaurya.vercel.app'),
  title: 'Ankit Raj Maurya | Full-Stack Developer & Creative Engineer',
  description:
    'Personal portfolio of Ankit Raj Maurya — Full-Stack Developer, Product Builder and Creative Engineer based in Muzaffarpur, Bihar, India. Specialized in production-ready web systems, community platforms, and interactive digital experiences.',
  authors: [{ name: 'Ankit Raj Maurya', url: 'https://ankitrajmaurya.vercel.app' }],
  creator: 'Ankit Raj Maurya',
  keywords: [
    'Ankit Raj Maurya',
    'Full-Stack Developer',
    'Creative Engineer',
    'Codex Monarch',
    'ReadyToGo',
    'Orbit UI',
    'Three.js Developer',
    'Next.js Portfolio',
    'Muzaffarpur Developer',
    'Bihar Developer',
  ],
  alternates: {
    canonical: 'https://ankitrajmaurya.vercel.app/',
  },
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ankitrajmaurya.vercel.app/',
    siteName: 'Ankit Raj Maurya Portfolio',
    title: 'Ankit Raj Maurya | Full-Stack Developer & Creative Engineer',
    description:
      'Explore the digital portfolio of Ankit Raj Maurya — featuring interactive WebGL shader portrait dispersion, production platforms, and verified engineering achievements.',
    images: [
      {
        url: '/img/hero-portrait.png',
        width: 1024,
        height: 1024,
        alt: 'Ankit Raj Maurya Portfolio Stage',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ankit Raj Maurya | Full-Stack Developer & Creative Engineer',
    description:
      'Full-Stack Developer & Creative Engineer. Building scalable web applications, community platforms, and interactive visual technology.',
    images: ['/img/hero-portrait.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body>
        {/* Interactive WebGL Shader Background */}
        <BackgroundShader />

        {/* Top Scroll Progress Bar & Reveal Manager */}
        <ScrollManager />

        {/* Global Floating Navigation */}
        <Navbar />

        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
