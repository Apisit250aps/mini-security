import type { Metadata } from 'next';
import { Kanit } from 'next/font/google';
import './globals.css';
import ClientProvider from '@/shared/hooks/client-provider';
import { SessionProvider } from '@/modules/auth/hooks/session-provider';
import { OverlayProvider } from '@repo/ui/hooks';
import { Toaster } from '@repo/ui/components/sonner';

const kanit = Kanit({
  subsets: ['latin', 'thai'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-kanit',
});

export const metadata: Metadata = {
  title: 'Mini Security',
  description: 'Clean Architecture with PBAC and Better Auth',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={`h-full antialiased ${kanit.variable}`}>
      <body className="min-h-full flex flex-col">
        <ClientProvider>
          <SessionProvider>
            <OverlayProvider>{children}</OverlayProvider>
          </SessionProvider>
        </ClientProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
