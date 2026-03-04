'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import { Header } from '@/components/layout';
import { LoadingScreen } from '@/components/ui';
import { TodoList } from '@/components/todos';

const DashboardBackground = dynamic(
  () => import('@/components/three/DashboardBackground').then(mod => ({ default: mod.DashboardBackground })),
  { ssr: false }
);

export default function TodosPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setIsLoading(false);
    };
    checkAuth();
  }, [router]);

  if (isLoading) {
    return <LoadingScreen message="Loading todos..." />;
  }

  return (
    <div className="h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      {/* Three.js animated background */}
      <DashboardBackground />
      
      {/* Main content */}
      <div className="relative z-10 flex flex-col h-full">
        <Header />
        
        {/* Page header */}
        <div className="flex items-center justify-between px-6 py-4 backdrop-blur-xl" style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'color-mix(in srgb, var(--color-bg-primary) 60%, transparent)' }}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 rounded-lg transition-all"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              ← Back
            </button>
            <div className="flex items-center gap-3">
              <div className="text-2xl">✓</div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Todo List</h1>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Manage your tasks and stay organized</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Todo List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <TodoList />
          </div>
        </div>
      </div>
    </div>
  );
}
