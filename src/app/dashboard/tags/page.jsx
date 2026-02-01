'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import { Header } from '@/components/layout';
import { Button, Input, Card, LoadingScreen } from '@/components/ui';
import toast from 'react-hot-toast';

// Dynamic import for Three.js background
const DashboardBackground = dynamic(
  () => import('@/components/three/DashboardBackground').then(mod => ({ default: mod.DashboardBackground })),
  { ssr: false }
);

export default function TagsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [tags, setTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTag, setEditingTag] = useState(null);
  const [newTagName, setNewTagName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      await fetchTags();
      setIsLoading(false);
    };
    init();
  }, [router]);

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags');
      const data = await response.json();
      if (data.success) {
        setTags(data.data);
      }
    } catch (error) {
      toast.error('Failed to load tags');
    }
  };

  const handleRenameTag = async (oldName) => {
    if (!newTagName.trim() || newTagName === oldName) {
      setEditingTag(null);
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch('/api/tags', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldName, newName: newTagName.trim() }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`Renamed tag to "${newTagName}"`);
        await fetchTags();
      } else {
        toast.error(data.error || 'Failed to rename tag');
      }
    } catch (error) {
      toast.error('Failed to rename tag');
    } finally {
      setIsUpdating(false);
      setEditingTag(null);
      setNewTagName('');
    }
  };

  const handleDeleteTag = async (tagName) => {
    if (!confirm(`Delete tag "${tagName}" from all notes?`)) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/tags?name=${encodeURIComponent(tagName)}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`Deleted tag "${tagName}"`);
        await fetchTags();
      } else {
        toast.error(data.error || 'Failed to delete tag');
      }
    } catch (error) {
      toast.error('Failed to delete tag');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalNotes = tags.reduce((sum, tag) => sum + tag.count, 0);

  if (isLoading) {
    return <LoadingScreen message="Loading tags..." />;
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
              <div className="text-2xl">🏷️</div>
              <div>
                <h1 className="text-xl font-bold text-zinc-100">Tag Management</h1>
                <p className="text-sm text-zinc-400">Organize and manage your tags</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-zinc-400">
              <span className="font-bold text-purple-500">{tags.length}</span> tags
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Search */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tags..."
                className="w-full pl-12 pr-4 py-3 bg-zinc-900/60 backdrop-blur-xl border border-zinc-700/50 
                  rounded-xl text-zinc-100 placeholder:text-zinc-500
                  focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none
                  transition-all duration-200"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="text-center">
                <div className="text-3xl font-bold text-purple-500">{tags.length}</div>
                <div className="text-sm text-zinc-400">Total Tags</div>
              </Card>
              <Card className="text-center">
                <div className="text-3xl font-bold text-purple-500">{totalNotes}</div>
                <div className="text-sm text-zinc-400">Tag Uses</div>
              </Card>
              <Card className="text-center">
                <div className="text-3xl font-bold text-purple-500">
                  {tags.length > 0 ? Math.round(totalNotes / tags.length) : 0}
                </div>
                <div className="text-sm text-zinc-400">Avg per Tag</div>
              </Card>
            </div>

            {/* Tags grid */}
            {filteredTags.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTags.map((tag) => (
                  <Card key={tag.name} hover className="group">
                    {editingTag === tag.name ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newTagName}
                          onChange={(e) => setNewTagName(e.target.value)}
                          className="flex-1 px-3 py-2 bg-zinc-950/50 border border-zinc-700/50 rounded-lg
                            text-zinc-100 focus:border-purple-500 focus:outline-none"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRenameTag(tag.name);
                            if (e.key === 'Escape') {
                              setEditingTag(null);
                              setNewTagName('');
                            }
                          }}
                        />
                        <button
                          onClick={() => handleRenameTag(tag.name)}
                          disabled={isUpdating}
                          className="p-2 text-green-400 hover:bg-green-400/20 rounded-lg transition-all"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => {
                            setEditingTag(null);
                            setNewTagName('');
                          }}
                          className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition-all"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🏷️</span>
                          <div>
                            <div className="font-medium text-zinc-100">#{tag.name}</div>
                            <div className="text-xs text-zinc-400">
                              {tag.count} {tag.count === 1 ? 'note' : 'notes'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingTag(tag.name);
                              setNewTagName(tag.name);
                            }}
                            className="p-2 text-zinc-400 hover:text-purple-400 hover:bg-purple-500/20 rounded-lg transition-all"
                            title="Rename tag"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteTag(tag.name)}
                            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/20 rounded-lg transition-all"
                            title="Delete tag"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <div className="text-4xl mb-4">🏷️</div>
                <h3 className="text-lg font-bold text-zinc-100 mb-2">
                  {searchQuery ? 'No tags found' : 'No tags yet'}
                </h3>
                <p className="text-zinc-400">
                  {searchQuery 
                    ? 'Try a different search term' 
                    : 'Add #tags to your notes to organize them'}
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
