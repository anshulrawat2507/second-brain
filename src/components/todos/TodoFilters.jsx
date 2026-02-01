'use client';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active', icon: '○' },
  { value: 'completed', label: 'Completed', icon: '✓' },
  { value: 'archived', label: 'Archived', icon: '📦' }
];

const PRIORITY_OPTIONS = [
  { value: '', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' }
];

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Created' },
  { value: 'due_date', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'task', label: 'Alphabetical' }
];

export function TodoFilters({ filters, onChange }) {
  const updateFilter = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-zinc-900/50 rounded-xl border border-zinc-700/50">
      {/* Status Tabs */}
      <div className="flex items-center gap-1 bg-zinc-800/50 rounded-lg p-1">
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => updateFilter('status', opt.value)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
              filters.status === opt.value
                ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'
            }`}
          >
            <span>{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

      <div className="h-6 w-px bg-zinc-700/50" />

      {/* Priority Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-500">Priority:</span>
        <select
          value={filters.priority}
          onChange={(e) => updateFilter('priority', e.target.value)}
          className="px-3 py-1.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        >
          {PRIORITY_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="h-6 w-px bg-zinc-700/50" />

      {/* Sort */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-500">Sort:</span>
        <select
          value={filters.sortBy}
          onChange={(e) => updateFilter('sortBy', e.target.value)}
          className="px-3 py-1.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button
          onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
          className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-all"
          title={filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        >
          {filters.sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>
    </div>
  );
}
