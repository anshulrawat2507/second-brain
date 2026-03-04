'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import { Header } from '@/components/layout';
import { Button, LoadingScreen } from '@/components/ui';

// Dynamic import for Three.js components to avoid SSR issues
const GraphView = dynamic(
  () => import('@/components/graph/GraphView').then(mod => ({ default: mod.GraphView })),
  { ssr: false, loading: () => <LoadingScreen message="Loading graph..." /> }
);

const DashboardBackground = dynamic(
  () => import('@/components/three/DashboardBackground').then(mod => ({ default: mod.DashboardBackground })),
  { ssr: false }
);

export default function GraphPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [showTagLinks, setShowTagLinks] = useState(false);

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

  const handleNodeClick = (noteId) => {
    router.push(`/dashboard?note=${noteId}`);
  };

  if (isLoading) {
    return <LoadingScreen message="Loading knowledge graph..." />;
  }

  return (
    <div className="h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <DashboardBackground />
      
      <div className="relative z-10 flex flex-col h-full">
        <Header />
        
        <div className="flex items-center justify-between px-6 py-4 backdrop-blur-xl"
          style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'color-mix(in srgb, var(--color-bg-secondary) 60%, transparent)' }}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 rounded-lg transition-all"
              style={{ color: 'var(--color-text-tertiary)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-accent)'; e.currentTarget.style.backgroundColor = 'var(--color-bg-elevated)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-tertiary)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              ← Back
            </button>
            <div className="flex items-center gap-3">
              <div className="text-2xl">🕸️</div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Knowledge Graph</h1>
                <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Visualize connections between your notes</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--color-text-tertiary)' }}>
              <input
                type="checkbox"
                checked={showTagLinks}
                onChange={(e) => setShowTagLinks(e.target.checked)}
                className="w-4 h-4 rounded"
                style={{ accentColor: 'var(--color-accent)' }}
              />
              Show tag connections
            </label>
          </div>
        </div>
        
        <div className="flex-1 relative">
          <GraphView onNodeClick={handleNodeClick} showTagLinks={showTagLinks} />
        </div>
      </div>
    </div>
  );
}
