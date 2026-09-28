import type { Metadata, Viewport } from 'next';
import { Newsreader, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { getLang } from '@/lib/lang';
import { getCurrentUser } from '@/lib/session';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

const serif = Newsreader({ subsets: ['latin'], variable: '--font-serif', style: ['normal', 'italic'], weight: ['400', '500', '600'] });
const mono = IBM_Plex_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400', '500'] });

const SITE_URL = process.env.SITE_URL ?? (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : 'http://localhost:3000');

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Encounter', template: '%s · Encounter' },
  description:
    'An honest, research-grounded look at Jesus and the Bible, in plain language. Hard questions welcome. A real invitation, and real freedom to say no.',
  openGraph: { siteName: 'Encounter', type: 'website' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f3ee' },
    { media: '(prefers-color-scheme: dark)', color: '#15130f' },
  ],
};

// Applies the saved theme before first paint so dark-mode readers never see a white flash.
const themeScript = `try{var t=localStorage.getItem('enc-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [lang, user] = await Promise.all([getLang(), getCurrentUser()]);
  return (
    <html lang={lang} data-elang={lang} className={`${serif.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 btn">
          Skip to content
        </a>
        <SiteHeader lang={lang} user={user ? { name: user.name, role: user.role } : null} />
        <main id="main">{children}</main>
        <SiteFooter lang={lang} />
      </body>
    </html>
  );
}
