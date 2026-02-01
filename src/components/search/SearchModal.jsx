'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Modal } from '@/components/ui';
import { formatDate, debounce } from '@/lib/utils';
import { useAppStore } from '@/lib/store';

export function SearchModal({ isOpen, onClose, onSelectNote }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Advanced filter states
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);

  const inputRef = useRef(null);
  const { folders } = useAppStore();

  const searchNotes = useCallback(
    async (searchQuery, filters = {}) => {
      if (!searchQuery.trim() && !filters.dateFrom && !filters.dateTo && !filters.folder) {
        setResults([]);
        setTotalCount(0);
        return;
      }

      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.set('q', searchQuery);
        if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.set('dateTo', filters.dateTo);
        if (filters.folder) params.set('folder', filters.folder);
        if (filters.caseSensitive) params.set('caseSensitive', 'true');
        if (filters.regex) params.set('regex', 'true');

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
        setIsLoading(false);
      }
    },
    []
  );

  const debouncedSearch = useCallback(
    debounce((searchQuery, filters) => {
      searchNotes(searchQuery, filters);
    }, 300),
    [searchNotes]
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setShowFilters(false);
      setDateFrom('');
      setDateTo('');
      setSelectedFolder('');
      setCaseSensitive(false);
      setUseRegex(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    debouncedSearch(query, { 
      dateFrom, 
      dateTo, 
      folder: selectedFolder, 
      caseSensitive, 
      regex: useRegex 
    });
  }, [query, dateFrom, dateTo, selectedFolder, caseSensitive, useRegex, debouncedSearch]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelectNote(results[selectedIndex]);
    }
  };

  const handleSelectNote = (note) => {
    onSelectNote(note);
    onClose();
  };

  const highlightMatch = (text, searchQuery) => {
    if (!searchQuery.trim()) return text;
    // Extract general terms from the query (not operators)
    const terms = searchQuery.split(/\s+/)
      .filter(t => !t.includes(':') && !t.startsWith('-') && t !== 'OR')
      .map(t => t.replace(/"/g, ''));
    if (terms.length === 0) return text;
    
    const regex = new RegExp(`(${terms.join('|')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-purple-500/30 text-zinc-100 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const hasActiveFilters = dateFrom || dateTo || selectedFolder || caseSensitive || useRegex;

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSelectedFolder('');
    setCaseSensitive(false);
    setUseRegex(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-zinc-500">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Search notes... (try title:keyword, tag:name, "exact phrase")'
            className="w-full pl-12 pr-16 py-4 text-base bg-zinc-800/40 border border-zinc-700/50 
              rounded-xl text-zinc-100 placeholder:text-zinc-500 
              focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:outline-none
              transition-all duration-200"
            autoFocus
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isLoading && (
              <svg className="animate-spin h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-xl transition-all duration-200 ${
                showFilters || hasActiveFilters 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                  : 'hover:bg-zinc-800/60 text-zinc-500 hover:text-zinc-300'
              }`}
              title="Toggle advanced filters"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Tips */}
        <div className="text-xs flex flex-wrap gap-2">
          <span className="px-2.5 py-1.5 rounded-lg bg-zinc-800/40 text-zinc-500 border border-zinc-700/30">title:word</span>
          <span className="px-2.5 py-1.5 rounded-lg bg-zinc-800/40 text-zinc-500 border border-zinc-700/30">tag:name</span>
          <span className="px-2.5 py-1.5 rounded-lg bg-zinc-800/40 text-zinc-500 border border-zinc-700/30">"exact phrase"</span>
          <span className="px-2.5 py-1.5 rounded-lg bg-zinc-800/40 text-zinc-500 border border-zinc-700/30">-exclude</span>
          <span className="px-2.5 py-1.5 rounded-lg bg-zinc-800/40 text-zinc-500 border border-zinc-700/30">word1 OR word2</span>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/30 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Date Range */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">From Date</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800/40 border border-zinc-700/50 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">To Date</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800/40 border border-zinc-700/50 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-purple-500/50"
                />
              </div>

              {/* Folder */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Folder</label>
                <select
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800/40 border border-zinc-700/50 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-purple-500/50"
                >
                  <option value="">All Folders</option>
                  {folders.map(folder => (
                    <option key={folder.id} value={folder.id}>{folder.name}</option>
                  ))}
                </select>
              </div>

              {/* Options */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={caseSensitive}
                    onChange={(e) => setCaseSensitive(e.target.checked)}
                    className="w-4 h-4 rounded accent-purple-500"
                  />
                  Case Sensitive
                </label>
                <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useRegex}
                    onChange={(e) => setUseRegex(e.target.checked)}
                    className="w-4 h-4 rounded accent-purple-500"
                  />
                  Regex
                </label>
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Results */}
        <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
          {results.length > 0 ? (
            <div className="space-y-2">
              <div className="text-sm text-zinc-500 px-2 pb-2">
                {totalCount} result{totalCount !== 1 ? 's' : ''} found
              </div>
              {results.map((note, index) => (
                <button
                  key={note.id}
                  onClick={() => handleSelectNote(note)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                    index === selectedIndex
                      ? 'bg-purple-500/15 border border-purple-500/50 shadow-lg shadow-purple-500/10'
                      : 'hover:bg-zinc-800/40 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {note.is_favorite && <span className="text-amber-400">⭐</span>}
                    <span className="font-semibold text-zinc-200">
                      {highlightMatch(note.title || 'Untitled', query)}
                    </span>
                  </div>
                  
                  {/* Match Context */}
                  {note.matchContext ? (
                    <p className="text-sm text-zinc-500 mt-2 line-clamp-2 leading-relaxed">
                      {highlightMatch(note.matchContext, query)}
                    </p>
                  ) : (
                    <p className="text-sm text-zinc-500 mt-2 line-clamp-2 leading-relaxed">
                      {highlightMatch(note.content?.slice(0, 150) || '', query)}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-3 mt-3 text-xs">
                    <span className="text-zinc-600">{formatDate(note.updated_at, 'relative')}</span>
                    {note.tags?.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        {note.tags.slice(0, 3).map((t) => (
                          <span key={t} className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 text-[10px] font-medium">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : query.trim() || hasActiveFilters ? (
            <div className="text-center py-12 text-zinc-500">
              <div className="text-4xl mb-4 opacity-50">🔍</div>
              {isLoading ? 'Searching...' : 'No notes found'}
              {hasActiveFilters && <p className="text-sm mt-2">Try adjusting your filters</p>}
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-500">
              <div className="text-4xl mb-4">💡</div>
              <p>Start typing to search your notes</p>
              <p className="text-xs mt-2 opacity-60">Use operators like title:, tag:, "quotes", or -exclude</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50 text-xs text-zinc-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="px-2 py-1 rounded-lg bg-zinc-800/60 border border-zinc-700/50 font-mono">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-2 py-1 rounded-lg bg-zinc-800/60 border border-zinc-700/50 font-mono">↵</kbd>
              Select
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-2 py-1 rounded-lg bg-zinc-800/60 border border-zinc-700/50 font-mono">Esc</kbd>
              Close
            </span>
          </div>
          {results.length > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-400 font-medium">
              {totalCount} results
            </span>
          )}
        </div>
      </div>
    </Modal>
  );
}
