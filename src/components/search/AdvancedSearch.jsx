'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '@/lib/store';

// Inline SVG Icons
const Icons = {
  search: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  ),
  x: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
  filter: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  ),
  clock: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  doc: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  tag: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
      <path d="M7 7h.01" />
    </svg>
  ),
};

export default function AdvancedSearch({ onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Filter states
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);

  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const { folders } = useAppStore();

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query && !dateFrom && !dateTo && !selectedFolder) {
      setResults([]);
      setTotalCount(0);
      return;
    }

    const timer = setTimeout(async () => {
      await performSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [query, dateFrom, dateTo, selectedFolder, caseSensitive, useRegex]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);
      if (selectedFolder) params.set('folder', selectedFolder);
      if (caseSensitive) params.set('caseSensitive', 'true');
      if (useRegex) params.set('regex', 'true');

      const response = await fetch(`/api/search?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setResults(data.data || []);
        setTotalCount(data.count || 0);
        setSelectedIndex(0);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      onSelect?.(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose?.();
    }
  }, [results, selectedIndex, onSelect, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    const container = resultsRef.current;
    const selected = container?.querySelector(`[data-index="${selectedIndex}"]`);
    if (selected) {
      selected.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSelectedFolder('');
    setCaseSensitive(false);
    setUseRegex(false);
  };

  const hasActiveFilters = dateFrom || dateTo || selectedFolder || caseSensitive || useRegex;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="p-4 border-b border-zinc-800/50">
          <div className="flex items-center gap-3">
            <span className="text-zinc-500 flex-shrink-0">{Icons.search}</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Search notes... (try title:keyword, tag:name, "exact phrase")'
              className="flex-1 bg-transparent text-zinc-100 placeholder-zinc-500 outline-none text-lg font-light"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                {Icons.x}
              </button>
            )}
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-all ${
                showFilters || hasActiveFilters 
                  ? 'bg-purple-500/20 text-purple-400' 
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              {Icons.filter}
            </button>
          </div>

          {/* Search Tips */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {['title:', 'tag:', '"exact"', '-exclude', 'OR'].map(tip => (
              <span key={tip} className="px-2 py-1 text-xs text-zinc-500 bg-zinc-800/50 rounded-md font-mono">
                {tip}
              </span>
            ))}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="p-4 border-b border-zinc-800/50 bg-zinc-900/50">
            <div className="grid grid-cols-2 gap-4">
              {/* Date Range */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">From Date</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-300 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">To Date</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-300 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>

              {/* Folder */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Folder</label>
                <select
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-300 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                >
                  <option value="">All Folders</option>
                  {(folders || []).map(folder => (
                    <option key={folder.id} value={folder.id}>{folder.name}</option>
                  ))}
                </select>
              </div>

              {/* Options */}
              <div className="flex items-end gap-4 pb-1">
                <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={caseSensitive}
                    onChange={(e) => setCaseSensitive(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-purple-500 focus:ring-purple-500/50"
                  />
                  <span className="group-hover:text-zinc-300 transition-colors">Case Sensitive</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={useRegex}
                    onChange={(e) => setUseRegex(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-purple-500 focus:ring-purple-500/50"
                  />
                  <span className="group-hover:text-zinc-300 transition-colors">Regex</span>
                </label>
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-3 text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Results */}
        <div ref={resultsRef} className="max-h-[50vh] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-3 text-sm text-zinc-500">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="px-4 py-2 text-xs text-zinc-500 bg-zinc-900/50">
                {totalCount} result{totalCount !== 1 ? 's' : ''}
              </div>
              {results.map((note, index) => (
                <div
                  key={note.id}
                  data-index={index}
                  onClick={() => onSelect?.(note)}
                  className={`p-4 cursor-pointer border-b border-zinc-800/30 last:border-b-0 transition-all ${
                    index === selectedIndex 
                      ? 'bg-purple-500/10 border-l-2 border-l-purple-500' 
                      : 'hover:bg-zinc-800/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-zinc-500 mt-0.5">{Icons.doc}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-zinc-200 truncate">
                        {note.title || 'Untitled'}
                      </h3>
                      
                      {/* Match Context */}
                      {note.matchContext && (
                        <p className="text-sm text-zinc-500 mt-1 line-clamp-2">
                          {note.matchContext}
                        </p>
                      )}

                      {/* Meta info */}
                      <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          {Icons.clock}
                          {new Date(note.updated_at).toLocaleDateString()}
                        </span>
                        {note.tags?.length > 0 && (
                          <span className="flex items-center gap-1">
                            {Icons.tag}
                            {note.tags.slice(0, 3).join(', ')}
                            {note.tags.length > 3 && ` +${note.tags.length - 3}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : query || hasActiveFilters ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-zinc-800/50 flex items-center justify-center text-zinc-600">
                {Icons.search}
              </div>
              <p className="text-zinc-400">No notes found</p>
              <p className="text-sm text-zinc-600 mt-1">Try different search terms</p>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-zinc-800/50 flex items-center justify-center text-zinc-600">
                {Icons.search}
              </div>
              <p className="text-zinc-400">Type to search your notes</p>
              <p className="text-sm text-zinc-600 mt-1">Use operators for advanced search</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-zinc-800/50 bg-zinc-900/80 text-xs text-zinc-500 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400 font-mono">↑↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400 font-mono">↵</kbd>
              <span>Open</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400 font-mono">esc</kbd>
              <span>Close</span>
            </span>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm -z-10" />
    </div>
  );
}
