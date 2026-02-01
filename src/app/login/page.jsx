import { Suspense } from 'react';
import { LoginForm } from '@/components/auth';
import { LoadingSpinner } from '@/components/ui';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--bg-primary)]">
      <Suspense fallback={<LoadingSpinner />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
