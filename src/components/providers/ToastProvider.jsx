'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 3000,
        className: 'toast',
        style: {
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
          fontFamily: 'var(--font-mono)',
        },
        success: {
          iconTheme: {
            primary: 'var(--success)',
            secondary: 'var(--bg-primary)',
          },
        },
        error: {
          iconTheme: {
            primary: 'var(--error)',
            secondary: 'var(--bg-primary)',
          },
        },
      }}
    />
  );
}
