import type { Metadata } from 'next';
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { LanguageProvider } from '@/context/language-context';
import { ToastProvider } from '@/context/toast-context';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'KK Group | Enterprise Workforce & Heavy Machinery Solutions',
  description:
    'Deploy on-demand verified teams for coconut harvesting, JCB earthmoving, plastering squads, and field operations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ml"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} lang-ml h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-zinc-900 font-sans selection:bg-emerald-500 selection:text-white">
        <LanguageProvider>
          <AuthProvider>
            <ToastProvider>
              <main className="flex-1 flex flex-col">{children}</main>
            </ToastProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
