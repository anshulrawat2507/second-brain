'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Header } from '@/components/layout';
import { Button, Card, LoadingScreen } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function TrashPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [trashedNotes, setTrashedNotes] = useState([]);

  useEffect(() => {
    const fetchTrash = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/login');
          return;
        }

        const response = await fetch('/api/trash');
        const data = await response.json();
        
        if (data.success) {
          setTrashedNotes(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching trash:', error);
        toast.error('Failed to load trash');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrash();
  }, [router]);

  const handleRestore = async (noteId) => {
    try {
      const response = await fetch('/api/trash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId }),
      });

      const data = await response.json();

      if (data.success) {
        setTrashedNotes((prev) => prev.filter((n) => n.id !== noteId));
        toast.success('Note restored');
      } else {
        toast.error('Failed to restore note');
      }
    } catch (error) {
      console.error('Error restoring note:', error);
      toast.error('Failed to restore note');
    }
  };

  const handlePermanentDelete = async (noteId) => {
    if (!confirm('Permanently delete this note? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/trash?noteId=${noteId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setTrashedNotes((prev) => prev.filter((n) => n.id !== noteId));
        toast.success('Note permanently deleted');
      } else {
        toast.error('Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const handleEmptyTrash = async () => {
    if (!confirm(`Permanently delete all ${trashedNotes.length} notes in trash? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch('/api/trash?emptyAll=true', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setTrashedNotes([]);
        toast.success('Trash emptied');
      } else {
        toast.error('Failed to empty trash');
      }
    } catch (error) {
      console.error('Error emptying trash:', error);
      toast.error('Failed to empty trash');
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Loading trash..." />;
  }

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)]">
      <Header />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                ← Back
              </button>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">
                🗑️ Trash
              </h1>
              <span className="text-sm text-[var(--text-secondary)]">
                {trashedNotes.length} items
              </span>
            </div>

            {trashedNotes.length > 0 && (
              <Button variant="danger" onClick={handleEmptyTrash}>
                Empty Trash
              </Button>
            )}
          </div>

          {/* Trashed Notes */}
          {trashedNotes.length > 0 ? (
            <div className="space-y-3">
              {trashedNotes.map((note) => (
                <Card key={note.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-[var(--text-primary)] truncate">
                        {note.title || 'Untitled'}
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)] mt-1 line-clamp-2">
                        {note.content.slice(0, 150)}...
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-secondary)] opacity-60">
                        <span>Deleted {formatDate(note.updated_at, 'relative')}</span>
                        {note.tags.length > 0 && (
                          <span className="text-[var(--accent)]">
                            {note.tags.slice(0, 3).map((t) => `#${t}`).join(' ')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRestore(note.id)}
                      >
                        Restore
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePermanentDelete(note.id)}
                        className="text-[var(--error)] border-[var(--error)] hover:bg-[var(--error)] hover:bg-opacity-10"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🗑️</div>
              <h2 className="text-xl font-medium text-[var(--text-primary)] mb-2">
                Trash is empty
              </h2>
              <p className="text-[var(--text-secondary)]">
                Deleted notes will appear here for 30 days
              </p>
              <Button
                variant="secondary"
                className="mt-6"
                onClick={() => router.push('/dashboard')}
              >
                Back to Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
