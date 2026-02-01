'use client';

export function BookmarkFilters({ filters, onChange, categories = [], tags = [] }) {
  const updateFilter = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-zinc-900/50 rounded-xl border border-zinc-700/50">
      {/* Search */}
      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
            🔍
          </span>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Search bookmarks..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
          />
        </div>
      </div>

      <div className="h-6 w-px bg-zinc-700/50" />

      {/* Category Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-500">Category:</span>
        <select
          value={filters.category}
          onChange={(e) => updateFilter('category', e.target.value)}
          className="px-3 py-1.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
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
          <div className="h-6 w-px bg-zinc-700/50" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">Tag:</span>
            <select
              value={filters.tag}
              onChange={(e) => updateFilter('tag', e.target.value)}
              className="px-3 py-1.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="">All</option>
              {tags.map(tag => (
                <option key={tag} value={tag}>#{tag}</option>
              ))}
            </select>
          </div>
        </>
      )}

      <div className="h-6 w-px bg-zinc-700/50" />

      {/* Sort */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-500">Sort:</span>
        <select
          value={filters.sortBy}
          onChange={(e) => updateFilter('sortBy', e.target.value)}
          className="px-3 py-1.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        >
          <option value="created_at">Date Added</option>
          <option value="title">Title</option>
          <option value="click_count">Clicks</option>
          <option value="last_accessed_at">Last Accessed</option>
        </select>
        <button
          onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
          className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-all"
          title={filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        >
          {filters.sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      {/* Clear Filters */}
      {(filters.category || filters.tag || filters.search) && (
        <button
          onClick={() => onChange({ ...filters, category: '', tag: '', search: '' })}
          className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
