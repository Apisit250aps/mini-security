import type { Metadata } from 'next';
import './globals.css';
import { SessionProvider } from '../modules/auth/hooks/session-provider';

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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
