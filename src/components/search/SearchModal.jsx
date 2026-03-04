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
    const terms = searchQuery.split(/\s+/)
      .filter(t => !t.includes(':') && !t.startsWith('-') && t !== 'OR')
      .map(t => t.replace(/"/g, ''));
    if (terms.length === 0) return text;
    
    const regex = new RegExp(`(${terms.join('|')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="px-0.5 rounded" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 30%, transparent)', color: 'var(--color-text-primary)' }}>
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
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl" style={{ color: 'var(--color-text-muted)' }}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Search notes... (try title:keyword, tag:name, "exact phrase")'
            className="w-full pl-12 pr-16 py-4 text-base rounded-xl focus:outline-none focus:ring-2 transition-all duration-200"
            style={{
              backgroundColor: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              '--tw-ring-color': 'color-mix(in srgb, var(--color-accent) 30%, transparent)',
            }}
            autoFocus
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isLoading && (
              <svg className="animate-spin h-4 w-4" style={{ color: 'var(--color-accent)' }} fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 rounded-xl transition-all duration-200"
              style={{
                backgroundColor: showFilters || hasActiveFilters ? 'var(--color-accent)' : 'transparent',
                color: showFilters || hasActiveFilters ? '#fff' : 'var(--color-text-muted)',
              }}
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
          {['title:word', 'tag:name', '"exact phrase"', '-exclude', 'word1 OR word2'].map(tip => (
            <span key={tip} className="px-2.5 py-1.5 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>{tip}</span>
          ))}
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="p-4 rounded-xl space-y-4" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-tertiary)' }}>From Date</label>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
                  style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-tertiary)' }}>To Date</label>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
                  style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-tertiary)' }}>Folder</label>
                <select value={selectedFolder} onChange={(e) => setSelectedFolder(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
                  style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}>
                  <option value="">All Folders</option>
                  {folders.map(folder => (
                    <option key={folder.id} value={folder.id}>{folder.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--color-text-tertiary)' }}>
                  <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: 'var(--color-accent)' }} />
                  Case Sensitive
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--color-text-tertiary)' }}>
                  <input type="checkbox" checked={useRegex} onChange={(e) => setUseRegex(e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: 'var(--color-accent)' }} />
                  Regex
                </label>
              </div>
            </div>

            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-sm transition-colors" style={{ color: 'var(--color-accent)' }}>
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            <div className="space-y-2">
              <div className="text-sm px-2 pb-2" style={{ color: 'var(--color-text-muted)' }}>
                {totalCount} result{totalCount !== 1 ? 's' : ''} found
              </div>
              {results.map((note, index) => (
                <button
                  key={note.id}
                  onClick={() => handleSelectNote(note)}
                  className="w-full text-left p-4 rounded-xl transition-all duration-200"
                  style={{
                    backgroundColor: index === selectedIndex ? 'color-mix(in srgb, var(--color-accent) 15%, transparent)' : 'transparent',
                    border: index === selectedIndex ? '1px solid color-mix(in srgb, var(--color-accent) 50%, transparent)' : '1px solid transparent',
                  }}
                >
                  <div className="flex items-center gap-2">
                    {note.is_favorite && <span className="text-amber-400">⭐</span>}
                    <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      {highlightMatch(note.title || 'Untitled', query)}
                    </span>
                  </div>
                  
                  {note.matchContext ? (
                    <p className="text-sm mt-2 line-clamp-2 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                      {highlightMatch(note.matchContext, query)}
                    </p>
                  ) : (
                    <p className="text-sm mt-2 line-clamp-2 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                      {highlightMatch(note.content?.slice(0, 150) || '', query)}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-3 mt-3 text-xs">
                    <span style={{ color: 'var(--color-text-muted)' }}>{formatDate(note.updated_at, 'relative')}</span>
                    {note.tags?.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        {note.tags.slice(0, 3).map((t) => (
                          <span key={t} className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                            style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 15%, transparent)', color: 'var(--color-accent)' }}>
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
            <div className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
              <div className="text-4xl mb-4 opacity-50">🔍</div>
              {isLoading ? 'Searching...' : 'No notes found'}
              {hasActiveFilters && <p className="text-sm mt-2">Try adjusting your filters</p>}
            </div>
          ) : (
            <div className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
              <div className="text-4xl mb-4">💡</div>
              <p>Start typing to search your notes</p>
              <p className="text-xs mt-2 opacity-60">Use operators like title:, tag:, "quotes", or -exclude</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 text-xs" style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
          <div className="flex items-center gap-4">
            {['↑↓ Navigate', '↵ Select', 'Esc Close'].map(hint => {
              const [key, label] = hint.split(' ');
              return (
                <span key={hint} className="flex items-center gap-1.5">
                  <kbd className="px-2 py-1 rounded-lg font-mono" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>{key}</kbd>
                  {label}
                </span>
              );
            })}
          </div>
          {results.length > 0 && (
            <span className="px-2.5 py-1 rounded-full font-medium"
              style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 15%, transparent)', color: 'var(--color-accent)' }}>
              {totalCount} results
            </span>
          )}
        </div>
      </div>
    </Modal>
  );
}
