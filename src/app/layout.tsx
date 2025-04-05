import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ToastProviders } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '블로그 어드민',
  description: '블로그 관리 시스템',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <AuthProvider>
          <ToastProviders>
            <div className="min-h-screen bg-background">
              <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center">
                  <Link href="/" className="flex items-center space-x-2">
                    <h1 className="font-bold">블로그 어드민</h1>
                  </Link>
                </div>
              </nav>
              <main className="container mx-auto">{children}</main>
            </div>
          </ToastProviders>
        </AuthProvider>
      </body>
    </html>
  );
}
