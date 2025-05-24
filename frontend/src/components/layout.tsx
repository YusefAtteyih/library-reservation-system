import { Providers } from './providers';
import { ApiProvider } from './api-provider';
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bahçeşehir University Library',
  description: 'Library reservation system for Bahçeşehir University',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ApiProvider>
            {children}
          </ApiProvider>
        </Providers>
      </body>
    </html>
  );
}
