import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GrowthTracker — Personal Growth OS',
  description:
    'A world-class personal growth operating system for DSA mastery, software development, roadmap execution, and career progression.',
  keywords: ['DSA', 'LeetCode tracker', 'developer growth', 'career roadmap', 'coding progress'],
  authors: [{ name: 'GrowthTracker' }],
  openGraph: {
    title: 'GrowthTracker — Personal Growth OS',
    description: 'Track your DSA progress, development achievements, and career roadmap in one premium dashboard.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#050507',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ background: 'var(--bg-base)', minHeight: '100dvh' }}
      >
        {children}
      </body>
    </html>
  );
}
