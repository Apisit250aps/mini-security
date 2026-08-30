import type { Metadata } from 'next';
import { Kanit } from 'next/font/google';
import './globals.css';
import { SessionProvider } from '@/modules/auth/hooks/session-provider';
import ClientProvider from '@/shared/hooks/client-provider';

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
          <SessionProvider>{children}</SessionProvider>
        </ClientProvider>
      </body>
    </html>
  );
}
