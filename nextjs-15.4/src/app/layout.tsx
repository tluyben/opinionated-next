import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { AuthProvider } from '@/components/auth/session-provider';
import { ErrorBoundary } from '@/components/error-tracking/error-boundary';
import { ErrorTrackingInitializer } from '@/components/error-tracking/error-tracking-initializer';
import '@/lib/error-tracking/init'; // Initialize server-side error handling

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Opinionated Next.js Starter',
  description: 'A comprehensive Next.js starter with everything you need',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <AuthProvider>
            <ThemeProvider defaultTheme="dark" enableSystem attribute="class">
              <ErrorTrackingInitializer />
              {children}
            </ThemeProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}