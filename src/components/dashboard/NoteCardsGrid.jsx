'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

// Extract preview from content
function getPreview(content, maxLength = 100) {
  const cleaned = content
    .replace(/^#+\s+/gm, '')
    .replace(/\*\*|__/g, '')
    .replace(/\*|_/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`[^`]+`/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\n+/g, ' ')
    .trim();
  
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.slice(0, maxLength).trim() + '...';
}

// Time ago helper
function getTimeAgo(date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function NoteCardsGrid({ notes, onNoteSelect, onCreateNote }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = useMemo(() => {
    let result = [...notes].sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.content.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [notes, searchQuery]);

  const favoriteNotes = filteredNotes.filter(n => n.is_favorite);
  const regularNotes = filteredNotes.filter(n => !n.is_favorite);

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-zinc-800">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">
                Your Notes
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                {notes.length} notes in your workspace
              </p>
            </div>
            <button
              onClick={onCreateNote}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl font-medium text-sm hover:from-purple-500 hover:to-violet-500 transition-all shadow-lg shadow-purple-500/20"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>New Note</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <svg 
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-5xl mx-auto">
          {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-500">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <h2 className="text-lg font-medium text-zinc-200 mb-1">
                {searchQuery ? 'No notes found' : 'No notes yet'}
              </h2>
              <p className="text-sm text-zinc-500 mb-6 max-w-sm">
                {searchQuery 
                  ? 'Try a different search term'
                  : 'Create your first note to start building your knowledge base'
                }
              </p>
              {!searchQuery && (
                <button
                  onClick={onCreateNote}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl text-sm font-medium hover:from-purple-500 hover:to-violet-500 transition-all shadow-lg shadow-purple-500/20"
                >
                  Create your first note
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Favorites */}
              {favoriteNotes.length > 0 && (
                <section>
                  <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="rgb(234, 179, 8)" stroke="rgb(234, 179, 8)" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    Favorites
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favoriteNotes.map((note) => (
                      <NoteCard key={note.id} note={note} onClick={() => onNoteSelect(note)} />
                    ))}
                  </div>
                </section>
              )}

              {/* All Notes */}
              <section>
                {favoriteNotes.length > 0 && regularNotes.length > 0 && (
                  <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
                    All Notes
                  </h3>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {regularNotes.map((note) => (
                    <NoteCard key={note.id} note={note} onClick={() => onNoteSelect(note)} />
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Individual Note Card - Minimalist Design
function NoteCard({ note, onClick }) {
  const preview = getPreview(note.content);
  const tags = note.tags?.slice(0, 2) || [];
  const timeAgo = getTimeAgo(new Date(note.updated_at));

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative w-full p-5 rounded-xl text-left transition-all',
        'bg-zinc-900/50 border border-zinc-700/50',
        'hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/5',
        'focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-zinc-950'
      )}
    >
      {/* Favorite indicator */}
      {note.is_favorite && (
        <div className="absolute top-4 right-4">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="rgb(234, 179, 8)" stroke="rgb(234, 179, 8)" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
      )}

      {/* Title */}
      <h3 className="font-medium text-zinc-200 mb-2 pr-6 line-clamp-1 group-hover:text-purple-400 transition-colors">
        {note.title || 'Untitled'}
      </h3>

      {/* Preview */}
      <p className="text-sm text-zinc-500 mb-4 line-clamp-2 min-h-[2.5rem]">
        {preview || 'Empty note...'}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Tags */}
        <div className="flex items-center gap-1.5">
          {tags.length > 0 ? (
            tags.map((tag) => (
              <span 
                key={tag}
                className="px-2 py-0.5 text-xs rounded-md bg-zinc-800 text-zinc-400"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-xs text-zinc-600">No tags</span>
          )}
        </div>

        {/* Time */}
        <span className="text-xs text-zinc-600">
          {timeAgo}
        </span>
      </div>

      {/* Hover indicator */}
      <div className="absolute inset-x-5 bottom-0 h-0.5 bg-gradient-to-r from-purple-600 to-violet-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
    </button>
  );
}
