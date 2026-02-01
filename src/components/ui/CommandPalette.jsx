'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function CommandPalette({
  isOpen,
  onClose,
  onCreateNote,
  onCreateFolder,
  onOpenSearch,
  onOpenTemplates,
  onOpenJournal,
  onOpenStats,
  onOpenThemes,
  onOpenSavedLinks,
}) {
  const router = useRouter();
  const { setEditorMode, editorMode, toggleSidebar } = useAppStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands = useMemo(() => [
    // Actions
    { id: 'new-note', icon: '📝', label: 'New Note', shortcut: '⌘N', category: 'Actions', action: () => { onCreateNote(); onClose(); } },
    { id: 'new-folder', icon: '📁', label: 'New Folder', category: 'Actions', action: () => { onCreateFolder(); onClose(); } },
    { id: 'search', icon: '🔍', label: 'Search Notes', shortcut: '⌘K', category: 'Actions', action: () => { onOpenSearch(); onClose(); } },
    { id: 'templates', icon: '📋', label: 'Open Templates', shortcut: '⌘T', category: 'Actions', action: () => { onOpenTemplates(); onClose(); } },
    { id: 'journal', icon: '📔', label: 'Daily Journal', shortcut: '⌘J', category: 'Actions', action: () => { onOpenJournal(); onClose(); } },
    { id: 'saved-links', icon: '🔗', label: 'Saved Links & Embeds', shortcut: '⌘L', category: 'Actions', action: () => { onOpenSavedLinks?.(); onClose(); } },
    
    // Navigation
    { id: 'dashboard', icon: '🏠', label: 'Go to Dashboard', category: 'Navigation', action: () => { router.push('/dashboard'); onClose(); } },
    { id: 'graph', icon: '🔗', label: 'Knowledge Graph', shortcut: '⌘G', category: 'Navigation', action: () => { router.push('/dashboard/graph'); onClose(); } },
    { id: 'tags', icon: '🏷️', label: 'Manage Tags', category: 'Navigation', action: () => { router.push('/dashboard/tags'); onClose(); } },
    { id: 'trash', icon: '🗑️', label: 'View Trash', category: 'Navigation', action: () => { router.push('/trash'); onClose(); } },
    
    // Editor Modes
    { id: 'mode-edit', icon: '✏️', label: 'Edit Mode', category: 'Editor', action: () => { setEditorMode('edit'); onClose(); } },
    { id: 'mode-preview', icon: '👁️', label: 'Preview Mode', category: 'Editor', action: () => { setEditorMode('preview'); onClose(); } },
    { id: 'mode-split', icon: '◫', label: 'Split Mode', category: 'Editor', action: () => { setEditorMode('split'); onClose(); } },
    { id: 'mode-focus', icon: '🎯', label: 'Focus Mode', category: 'Editor', action: () => { setEditorMode('focus'); onClose(); } },
    { id: 'mode-zen', icon: '🧘', label: 'Zen Mode', category: 'Editor', action: () => { setEditorMode('zen'); onClose(); } },
    { id: 'mode-typewriter', icon: '⌨️', label: 'Typewriter Mode', category: 'Editor', action: () => { setEditorMode('typewriter'); onClose(); } },
    { id: 'mode-reading', icon: '📖', label: 'Reading Mode', category: 'Editor', action: () => { setEditorMode('reading'); onClose(); } },
    
    // Settings
    { id: 'themes', icon: '🎨', label: 'Change Theme', category: 'Settings', action: () => { onOpenThemes(); onClose(); } },
    { id: 'stats', icon: '📊', label: 'View Statistics', category: 'Settings', action: () => { onOpenStats(); onClose(); } },
    { id: 'toggle-sidebar', icon: '◀', label: 'Toggle Sidebar', shortcut: '⌘\\', category: 'Settings', action: () => { toggleSidebar(); onClose(); } },
  ], [router, setEditorMode, toggleSidebar, onCreateNote, onCreateFolder, onOpenSearch, onOpenTemplates, onOpenJournal, onOpenStats, onOpenThemes, onClose]);

  const filteredCommands = useMemo(() => {
    if (!query) return commands;
    const lowerQuery = query.toLowerCase();
    return commands.filter(cmd => 
      cmd.label.toLowerCase().includes(lowerQuery) ||
      cmd.category.toLowerCase().includes(lowerQuery)
    );
  }, [commands, query]);

  const groupedCommands = useMemo(() => {
    const groups = {};
    filteredCommands.forEach(cmd => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = [];
      }
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Reset query when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  let flatIndex = 0;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] pointer-events-none">
        <div 
          className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 rounded-2xl shadow-2xl shadow-black/50 w-full max-w-lg pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-200 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800/50">
            <span className="text-purple-400 text-lg">⌘</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or search..."
              autoFocus
              className="flex-1 bg-transparent text-zinc-100 placeholder-zinc-500 outline-none text-sm"
            />
            <kbd className="px-2 py-1 text-[10px] bg-zinc-800/60 text-zinc-500 rounded-lg border border-zinc-700/50 font-mono">
              ESC
            </kbd>
          </div>

          {/* Commands List */}
          <div className="max-h-80 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
            {Object.entries(groupedCommands).map(([category, cmds]) => (
              <div key={category} className="mb-3">
                <div className="px-3 py-1.5 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                  {category}
                </div>
                {cmds.map((cmd) => {
                  const index = flatIndex++;
                  const isSelected = index === selectedIndex;
                  
                  return (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left',
                        isSelected
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                          : 'text-zinc-300 hover:bg-zinc-800/60'
                      )}
                    >
                      <span className="text-lg">{cmd.icon}</span>
                      <span className="flex-1 text-sm font-medium">{cmd.label}</span>
                      {cmd.shortcut && (
                        <kbd className={cn(
                          'px-2 py-1 text-[10px] rounded-lg font-mono',
                          isSelected 
                            ? 'bg-white/20 text-white' 
                            : 'bg-zinc-800/60 text-zinc-500 border border-zinc-700/50'
                        )}>
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}

            {filteredCommands.length === 0 && (
              <div className="py-10 text-center text-zinc-500">
                <p className="text-sm">No commands found</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-zinc-800/50 bg-zinc-900/50 flex items-center justify-between text-[10px] text-zinc-600">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="px-1.5 py-0.5 bg-zinc-800/60 rounded border border-zinc-700/50">↑↓</span>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <span className="px-1.5 py-0.5 bg-zinc-800/60 rounded border border-zinc-700/50">↵</span>
                Select
              </span>
            </div>
            <span>ESC to close</span>
          </div>
        </div>
      </div>
    </>
  );
}
