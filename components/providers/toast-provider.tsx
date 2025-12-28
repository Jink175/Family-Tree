'use client';

import { Toaster } from '@/components/ui/sonner';

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster 
        richColors 
        closeButton 
        position="top-right" 
      />
    </>
  );
}