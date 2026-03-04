'use client';

import { useState } from 'react';

export function BookmarkForm({ bookmark, onSubmit, onCancel, categories = [] }) {
  const [url, setUrl] = useState(bookmark?.url || '');
  const [title, setTitle] = useState(bookmark?.title || '');
  const [description, setDescription] = useState(bookmark?.description || '');
  const [category, setCategory] = useState(bookmark?.category || '');
  const [newCategory, setNewCategory] = useState('');
  const [tags, setTags] = useState(bookmark?.tags?.join(', ') || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url.trim()) return;

    setLoading(true);

    const bookmarkData = {
      url: url.trim(),
      title: title.trim() || undefined, // Let API auto-fetch if empty
      description: description.trim(),
      category: newCategory.trim() || category,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean)
    };

    await onSubmit(bookmarkData);
    setLoading(false);
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="p-4 backdrop-blur-xl rounded-xl border space-y-4"
      style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)' }}
    >
      {/* URL Input */}
      <div>
        <label className="block text-sm mb-1.5 font-medium" style={{ color: 'var(--color-text-secondary)' }}>URL *</label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="w-full px-4 py-3 border rounded-xl focus:outline-none transition-all"
          style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
          required
          autoFocus
        />
        <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-tertiary)' }}>
          Title and description will be auto-fetched if left empty
        </p>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm mb-1.5 font-medium" style={{ color: 'var(--color-text-secondary)' }}>Title (optional)</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Leave empty to auto-fetch"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none transition-all"
          style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm mb-1.5 font-medium" style={{ color: 'var(--color-text-secondary)' }}>Description (optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description..."
          rows={2}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none resize-none transition-all"
          style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm mb-1.5 font-medium" style={{ color: 'var(--color-text-secondary)' }}>Category</label>
        <div className="flex gap-2">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setNewCategory('');
            }}
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none"
            style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
          >
            <option value="">No category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="text"
            value={newCategory}
            onChange={(e) => {
              setNewCategory(e.target.value);
              setCategory('');
            }}
            placeholder="Or create new..."
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none"
            style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
          />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm mb-1.5 font-medium" style={{ color: 'var(--color-text-secondary)' }}>Tags (comma-separated)</label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="design, reference, tutorial"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none"
          style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 transition-colors"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!url.trim() || loading}
          className="px-4 py-2 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          {loading && (
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          )}
          {bookmark ? 'Update' : 'Save Bookmark'}
        </button>
      </div>
    </form>
  );
}
