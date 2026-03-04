'use client';

export function BookmarkFilters({ filters, onChange, categories = [], tags = [] }) {
  const updateFilter = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl border" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)' }}>
      {/* Search */}
      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-tertiary)' }}>
            🔍
          </span>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Search bookmarks..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none transition-all"
            style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
          />
        </div>
      </div>

      <div className="h-6 w-px" style={{ backgroundColor: 'var(--color-border)' }} />

      {/* Category Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Category:</span>
        <select
          value={filters.category}
          onChange={(e) => updateFilter('category', e.target.value)}
          className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none"
          style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
        >
          <option value="">All</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Tag Filter */}
      {tags.length > 0 && (
        <>
          <div className="h-6 w-px" style={{ backgroundColor: 'var(--color-border)' }} />
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Tag:</span>
            <select
              value={filters.tag}
              onChange={(e) => updateFilter('tag', e.target.value)}
              className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none"
              style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              <option value="">All</option>
              {tags.map(tag => (
                <option key={tag} value={tag}>#{tag}</option>
              ))}
            </select>
          </div>
        </>
      )}

      <div className="h-6 w-px" style={{ backgroundColor: 'var(--color-border)' }} />

      {/* Sort */}
      <div className="flex items-center gap-2">
        <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Sort:</span>
        <select
          value={filters.sortBy}
          onChange={(e) => updateFilter('sortBy', e.target.value)}
          className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none"
          style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
        >
          <option value="created_at">Date Added</option>
          <option value="title">Title</option>
          <option value="click_count">Clicks</option>
          <option value="last_accessed_at">Last Accessed</option>
        </select>
        <button
          onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
          className="p-1.5 rounded-lg transition-all"
          style={{ color: 'var(--color-text-secondary)' }}
          title={filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        >
          {filters.sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      {/* Clear Filters */}
      {(filters.category || filters.tag || filters.search) && (
        <button
          onClick={() => onChange({ ...filters, category: '', tag: '', search: '' })}
          className="text-sm transition-colors"
          style={{ color: 'var(--color-accent)' }}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
