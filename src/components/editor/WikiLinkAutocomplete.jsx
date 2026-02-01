'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';

export function WikiLinkAutocomplete({ 
  notes = [], 
  onSelect, 
  position, 
  searchText,
  onClose,
  onCreate
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef(null);

  // Filter notes based on search text
  const filteredNotes = useMemo(() => {
    if (!searchText) return notes.slice(0, 10);
    
    const search = searchText.toLowerCase();
    return notes
      .filter(note => note.title.toLowerCase().includes(search))
      .slice(0, 10);
  }, [notes, searchText]);

  // Check if search is for a header (contains #)
  const hasHeader = searchText.includes('#');
  const [noteSearch, headerSearch] = hasHeader 
    ? searchText.split('#') 
    : [searchText, ''];

  // Reset selection when filtered list changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredNotes]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(i => Math.min(i + 1, filteredNotes.length));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(i => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex === filteredNotes.length) {
            // Create new note option
            onCreate(searchText);
          } else if (filteredNotes[selectedIndex]) {
            onSelect(filteredNotes[selectedIndex], headerSearch);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredNotes, selectedIndex, onSelect, onClose, onCreate, searchText, headerSearch]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedItem = listRef.current.children[selectedIndex];
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!position) return null;

  const dropdown = (
    <div
      className="fixed z-50 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 rounded-xl shadow-xl overflow-hidden min-w-[250px] max-w-[400px] max-h-[300px] overflow-y-auto"
      style={{
        top: position.top,
        left: position.left
      }}
      ref={listRef}
    >
      {filteredNotes.length === 0 && !searchText && (
        <div className="px-4 py-3 text-sm text-zinc-500">
          Type to search notes...
        </div>
      )}

      {filteredNotes.map((note, index) => (
        <button
          key={note.id}
          onClick={() => onSelect(note, headerSearch)}
          className={`w-full px-4 py-2.5 text-left flex items-center gap-3 transition-colors ${
            index === selectedIndex
              ? 'bg-purple-500/20 text-zinc-100'
              : 'text-zinc-400 hover:bg-zinc-800'
          }`}
        >
          <span className="text-lg">
            {note.is_favorite ? '⭐' : '📝'}
          </span>
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{note.title}</div>
            {note.folder_name && (
              <div className="text-xs text-zinc-500 truncate">
                📁 {note.folder_name}
              </div>
            )}
          </div>
        </button>
      ))}

      {/* Create new note option */}
      {searchText && (
        <button
          onClick={() => onCreate(searchText)}
          className={`w-full px-4 py-2.5 text-left flex items-center gap-3 border-t border-zinc-700/50 transition-colors ${
            selectedIndex === filteredNotes.length
              ? 'bg-purple-500/20 text-zinc-100'
              : 'text-zinc-400 hover:bg-zinc-800'
          }`}
        >
          <span className="text-lg">➕</span>
          <div className="flex-1 min-w-0">
            <div className="font-medium">Create &quot;{searchText}&quot;</div>
            <div className="text-xs text-zinc-500">
              Create a new note with this title
            </div>
          </div>
        </button>
      )}
    </div>
  );

  // Use portal to render dropdown at document root
  if (typeof window !== 'undefined') {
    return createPortal(dropdown, document.body);
  }
  
  return null;
}
