'use client';

import { AuthProvider } from '@/components/auth/AuthContext';
import { DodoPaymentsProvider } from 'dodo-payments-sdk';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DodoPaymentsProvider mode="test">
          <AuthProvider>
            {children}
          </AuthProvider>
        </DodoPaymentsProvider>
      </body>
    </html>
  );
}
