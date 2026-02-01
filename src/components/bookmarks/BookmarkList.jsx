'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { BookmarkItem } from './BookmarkItem';
import { BookmarkForm } from './BookmarkForm';
import { BookmarkFilters } from './BookmarkFilters';

export function BookmarkList() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ categories: [], tags: [] });
  const [filters, setFilters] = useState({
    category: '',
    tag: '',
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [showForm, setShowForm] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [checkingLinks, setCheckingLinks] = useState(false);

  const fetchBookmarks = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.set('category', filters.category);
      if (filters.tag) params.set('tag', filters.tag);
      if (filters.search) params.set('search', filters.search);
      if (filters.sortBy) params.set('sortBy', filters.sortBy);
      if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

      const response = await fetch(`/api/bookmarks?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setBookmarks(result.data);
        setMeta(result.meta);
      } else {
        toast.error(result.error || 'Failed to fetch bookmarks');
      }
    } catch (error) {
      toast.error('Failed to fetch bookmarks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const handleCreate = async (bookmarkData) => {
    try {
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookmarkData)
      });
      const result = await response.json();

      if (result.success) {
        setBookmarks(prev => [result.data, ...prev]);
        setShowForm(false);
        toast.success('Bookmark saved!');
      } else {
        toast.error(result.error || 'Failed to save bookmark');
      }
    } catch (error) {
      toast.error('Failed to save bookmark');
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      const response = await fetch(`/api/bookmarks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const result = await response.json();

      if (result.success) {
        setBookmarks(prev => prev.map(b => b.id === id ? result.data : b));
        setEditingBookmark(null);
      } else {
        toast.error(result.error || 'Failed to update bookmark');
      }
    } catch (error) {
      toast.error('Failed to update bookmark');
    }
  };

  const handleClick = async (bookmark) => {
    // Track click and open URL
    await fetch(`/api/bookmarks/${bookmark.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incrementClick: true })
    });
    
    setBookmarks(prev => prev.map(b => 
      b.id === bookmark.id ? { ...b, click_count: (b.click_count || 0) + 1 } : b
    ));
    
    window.open(bookmark.url, '_blank');
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this bookmark?')) return;

    try {
      const response = await fetch(`/api/bookmarks/${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();

      if (result.success) {
        setBookmarks(prev => prev.filter(b => b.id !== id));
        toast.success('Bookmark deleted');
      } else {
        toast.error(result.error || 'Failed to delete bookmark');
      }
    } catch (error) {
      toast.error('Failed to delete bookmark');
    }
  };

  const handleCheckLinks = async () => {
    setCheckingLinks(true);
    try {
      const response = await fetch('/api/bookmarks/check', {
        method: 'POST'
      });
      const result = await response.json();

      if (result.success) {
        if (result.data.broken > 0) {
          toast.error(`Found ${result.data.broken} broken links`);
        } else {
          toast.success('All links are working!');
        }
      }
    } catch (error) {
      toast.error('Failed to check links');
    } finally {
      setCheckingLinks(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await fetch('/api/bookmarks/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format })
      });

      if (format === 'html') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bookmarks.html';
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const result = await response.json();
        const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bookmarks.json';
        a.click();
        window.URL.revokeObjectURL(url);
      }
      
      toast.success('Bookmarks exported!');
    } catch (error) {
      toast.error('Failed to export bookmarks');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-zinc-400">Loading bookmarks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🔗</div>
          <div>
            <h2 className="text-xl font-bold text-zinc-200">Bookmarks</h2>
            <p className="text-sm text-zinc-400">
              {bookmarks.length} saved links
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-zinc-800/50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
              title="List view"
            >
              ☰
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
              title="Grid view"
            >
              ⊞
            </button>
          </div>

          {/* Check Links */}
          <button
            onClick={handleCheckLinks}
            disabled={checkingLinks}
            className="px-3 py-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-all disabled:opacity-50"
            title="Check for broken links"
          >
            {checkingLinks ? '⏳' : '🔍'}
          </button>

          {/* Export */}
          <div className="relative group">
            <button className="px-3 py-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-all">
              📤
            </button>
            <div className="absolute right-0 top-full mt-1 bg-zinc-900 border border-zinc-700/50 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => handleExport('json')}
                className="block w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-800 rounded-t-xl"
              >
                Export as JSON
              </button>
              <button
                onClick={() => handleExport('html')}
                className="block w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-800 rounded-b-xl"
              >
                Export as HTML
              </button>
            </div>
          </div>

          {/* Add Bookmark */}
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl hover:from-purple-500 hover:to-violet-500 transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20"
          >
            <span>+</span>
            <span>Add Bookmark</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <BookmarkFilters 
        filters={filters} 
        onChange={setFilters}
        categories={meta.categories}
        tags={meta.tags}
      />

      {/* Add Bookmark Form */}
      {showForm && (
        <BookmarkForm 
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          categories={meta.categories}
        />
      )}

      {/* Bookmark List/Grid */}
      {bookmarks.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-700/50">
          <div className="text-4xl mb-4">🔗</div>
          <p className="text-zinc-400">
            No bookmarks yet. Save your first link!
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookmarks.map(bookmark => (
            <BookmarkItem
              key={bookmark.id}
              bookmark={bookmark}
              onClick={handleClick}
              onEdit={() => setEditingBookmark(bookmark)}
              onDelete={handleDelete}
              isGrid
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {bookmarks.map(bookmark => (
            <BookmarkItem
              key={bookmark.id}
              bookmark={bookmark}
              onClick={handleClick}
              onEdit={() => setEditingBookmark(bookmark)}
              onDelete={handleDelete}
              isEditing={editingBookmark?.id === bookmark.id}
              onUpdate={handleUpdate}
              onCancelEdit={() => setEditingBookmark(null)}
              categories={meta.categories}
            />
          ))}
        </div>
      )}
    </div>
  );
}
