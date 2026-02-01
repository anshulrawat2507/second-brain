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
    <div className="h-screen flex flex-col bg-zinc-950 relative overflow-hidden">
      {/* Three.js animated background */}
      <DashboardBackground />
      
      {/* Main content */}
      <div className="relative z-10 flex flex-col h-full">
        <Header />
        
        {/* Page header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-700/50 bg-zinc-900/60 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-zinc-800/50 rounded-lg transition-all text-zinc-400 hover:text-purple-400"
            >
              ← Back
            </button>
            <div className="flex items-center gap-3">
              <div className="text-2xl">🕸️</div>
              <div>
                <h1 className="text-xl font-bold text-zinc-100">Knowledge Graph</h1>
                <p className="text-sm text-zinc-400">Visualize connections between your notes</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
              <input
                type="checkbox"
                checked={showTagLinks}
                onChange={(e) => setShowTagLinks(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-purple-500 focus:ring-purple-500"
              />
              Show tag connections
            </label>
          </div>
        </div>
        
        {/* Graph container */}
        <div className="flex-1 relative">
          <GraphView onNodeClick={handleNodeClick} showTagLinks={showTagLinks} />
        </div>
      </div>
    </div>
  );
}
