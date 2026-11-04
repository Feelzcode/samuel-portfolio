import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/inter';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import { SITE } from '@/content/site';
import './globals.css';

// On Vercel the production domain is picked up automatically; set NEXT_PUBLIC_SITE_URL to override.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: SITE.fullName,
  description: SITE.role,
  openGraph: { title: SITE.fullName, description: SITE.role, images: [SITE.photo], type: 'website' },
  twitter: { card: 'summary', title: SITE.fullName, description: SITE.role, images: [SITE.photo] },
};

export const viewport: Viewport = { themeColor: '#08090a', viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
