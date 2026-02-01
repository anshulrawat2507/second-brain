'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui';
import toast from 'react-hot-toast';

export function QuickNotesPanel({ isOpen, onClose, onSave }) {
  const [content, setContent] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setContent('');
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!content.trim()) {
      toast.error('Note content is empty');
      return;
    }
    onSave(content);
    setContent('');
    onClose();
  };

  const handleKeyDown = (e) => {
    // Ctrl/Cmd + Enter to save
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
    // Escape to close
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 rounded-2xl shadow-2xl shadow-black/50 z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700/50">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚡</span>
          <span className="text-sm font-semibold text-zinc-200">Quick Note</span>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Jot down a quick thought..."
          className="w-full h-32 p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl 
            text-zinc-200 placeholder:text-zinc-500
            focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:outline-none resize-none text-sm transition-all"
        />

        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-zinc-500 flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px] font-medium text-zinc-400">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px] font-medium text-zinc-400">Enter</kbd>
            <span className="text-zinc-600">to save</span>
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
