'use client';

import { Toaster } from 'sonner';

export function ToastProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
