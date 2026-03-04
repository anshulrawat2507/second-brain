'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';

export function WikiLinkPreview({ url, noteId, notes, position, onNavigate }) {
  const [note, setNote] = useState(null);

  useEffect(() => {
    if (noteId && notes) {
      const found = notes.find(n => n.id === noteId);
      setNote(found || null);
    }
  }, [noteId, notes]);

  if (!position || !note) return null;

  const preview = (
    <div
      className="fixed z-50 w-80 backdrop-blur-xl rounded-xl shadow-xl overflow-hidden"
      style={{
        top: position.top,
        left: position.left,
        backgroundColor: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)'
      }}
    >
      {/* Header */}
      <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="flex items-center gap-2">
          <span>{note.is_favorite ? '⭐' : '📝'}</span>
          <span className="font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
            {note.title}
          </span>
        </div>
        {note.folder_name && (
          <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            📁 {note.folder_name}
          </div>
        )}
      </div>

      {/* Content Preview */}
      <div className="px-4 py-3 max-h-40 overflow-hidden">
        <p className="text-sm line-clamp-5" style={{ color: 'var(--color-text-secondary)' }}>
          {note.content?.slice(0, 300) || 'No content'}
          {note.content?.length > 300 && '...'}
        </p>
      </div>

      {/* Footer */}
      <div className="px-4 py-2" style={{ borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
        <button
          onClick={() => onNavigate(note.id)}
          className="text-xs"
          style={{ color: 'var(--color-accent-muted)' }}
        >
          Open note →
        </button>
      </div>
    </div>
  );

  if (typeof window !== 'undefined') {
    return createPortal(preview, document.body);
  }

  return null;
}
