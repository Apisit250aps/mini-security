import type { Metadata } from 'next';
import type { Permission } from '@repo/domains/entities';
import { Kanit } from 'next/font/google';
import './globals.css';
import ClientProvider from '@/shared/hooks/client-provider';
import { SessionProvider } from '@/modules/auth/hooks/session-provider';
import { OverlayProvider } from '@repo/ui/hooks';
import { Toaster } from '@repo/ui/components/sonner';
import auth from '@repo/infrastructures/auth';
import { headers } from 'next/headers';
import { getPermissions } from '@/modules/auth/helpers';

const kanit = Kanit({
  subsets: ['latin', 'thai'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-kanit',
});

export const metadata: Metadata = {
  title: 'Mini Security',
  description: 'Clean Architecture with PBAC and Better Auth',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const permissions: Permission[] = await getPermissions(session);

  return (
    <html lang="th" className={`h-full antialiased ${kanit.variable}`}>
      <body className="min-h-full flex flex-col">
        <SessionProvider session={session} permissions={permissions}>
          <ClientProvider>
            <OverlayProvider>{children}</OverlayProvider>
          </ClientProvider>
        </SessionProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
