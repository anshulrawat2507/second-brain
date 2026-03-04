'use client';

import { useState, useEffect, useMemo } from 'react';

export function BacklinksPanel({ noteId, noteTitle, notes = [], onNavigate }) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Calculate backlinks from the notes array (client-side)
  const backlinks = useMemo(() => {
    if (!noteTitle || !notes.length) return [];

    const pattern = new RegExp(`\\[\\[(${noteTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(\\|[^\\]]+)?\\]\\]`, 'gi');
    
    return notes
      .filter(note => note.id !== noteId && pattern.test(note.content || ''))
      .map(note => {
        // Reset lastIndex for each note
        pattern.lastIndex = 0;
        
        // Find context around the link
        const content = note.content || '';
        const matchIndex = content.search(pattern);
        let context = '';
        
        if (matchIndex !== -1) {
          const start = Math.max(0, matchIndex - 40);
          const end = Math.min(content.length, matchIndex + 80);
          context = content.slice(start, end);
          if (start > 0) context = '...' + context;
          if (end < content.length) context = context + '...';
        }

        // Count total mentions
        pattern.lastIndex = 0;
        const matches = content.match(pattern) || [];

        return {
          id: note.id,
          title: note.title,
          context,
          linkCount: matches.length,
          isFavorite: note.is_favorite
        };
      });
  }, [noteId, noteTitle, notes]);

  if (backlinks.length === 0) {
    return null;
  }

  return (
    <div 
      style={{ borderTop: '1px solid var(--color-border)', backgroundColor: 'color-mix(in srgb, var(--color-bg-secondary) 50%, transparent)' }}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          <span>🔗</span>
          <span className="font-medium">Backlinks</span>
          <span className="text-xs px-1.5 py-0.5 text-white rounded" style={{ backgroundColor: 'var(--color-accent)' }}>
            {backlinks.length}
          </span>
        </div>
        <span 
          className={`transition-transform ${
            isExpanded ? 'rotate-90' : ''
          }`}
          style={{ color: 'var(--color-text-muted)' }}
        >
          ▶
        </span>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-2">
          {backlinks.map((backlink) => (
            <button
              key={backlink.id}
              onClick={() => onNavigate(backlink.id)}
              className="w-full text-left p-2 rounded transition-colors group"
              style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">
                  {backlink.isFavorite ? '⭐' : '📝'}
                </span>
                <span className="text-sm font-medium transition-colors flex-1 truncate" style={{ color: 'var(--color-text-primary)' }}>
                  {backlink.title}
                </span>
                {backlink.linkCount > 1 && (
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    ×{backlink.linkCount}
                  </span>
                )}
              </div>
              <p className="text-xs line-clamp-2 pl-6" style={{ color: 'var(--color-text-muted)' }}>
                {backlink.context}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
