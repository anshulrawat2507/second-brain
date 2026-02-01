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
      className="fixed z-50 w-80 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 rounded-xl shadow-xl overflow-hidden"
      style={{
        top: position.top,
        left: position.left
      }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-700/50 bg-zinc-800/50">
        <div className="flex items-center gap-2">
          <span>{note.is_favorite ? '⭐' : '📝'}</span>
          <span className="font-medium text-zinc-100 truncate">
            {note.title}
          </span>
        </div>
        {note.folder_name && (
          <div className="text-xs text-zinc-500 mt-1">
            📁 {note.folder_name}
          </div>
        )}
      </div>

      {/* Content Preview */}
      <div className="px-4 py-3 max-h-40 overflow-hidden">
        <p className="text-sm text-zinc-400 line-clamp-5">
          {note.content?.slice(0, 300) || 'No content'}
          {note.content?.length > 300 && '...'}
        </p>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-zinc-700/50 bg-zinc-800/50">
        <button
          onClick={() => onNavigate(note.id)}
          className="text-xs text-purple-400 hover:text-purple-300"
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
