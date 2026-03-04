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
    <div 
      className="flex flex-wrap items-center gap-4 p-4 rounded-xl border"
      style={{ 
        backgroundColor: 'color-mix(in srgb, var(--color-bg-secondary) 50%, transparent)',
        borderColor: 'color-mix(in srgb, var(--color-border) 50%, transparent)'
      }}
    >
      {/* Status Tabs */}
      <div 
        className="flex items-center gap-1 rounded-lg p-1"
        style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg-secondary) 50%, transparent)' }}
      >
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => updateFilter('status', opt.value)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
              filters.status === opt.value ? 'text-white' : ''
            }`}
            style={
              filters.status === opt.value
                ? { 
                    backgroundColor: 'var(--color-accent)',
                    boxShadow: '0 10px 15px -3px color-mix(in srgb, var(--color-accent) 20%, transparent)'
                  }
                : { color: 'var(--color-text-secondary)' }
            }
            onMouseEnter={(e) => {
              if (filters.status !== opt.value) {
                e.currentTarget.style.color = 'var(--color-text-primary)';
                e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-bg-elevated) 50%, transparent)';
              }
            }}
            onMouseLeave={(e) => {
              if (filters.status !== opt.value) {
                e.currentTarget.style.color = 'var(--color-text-secondary)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span>{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

      <div className="h-6 w-px" style={{ backgroundColor: 'color-mix(in srgb, var(--color-border) 50%, transparent)' }} />

      {/* Priority Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Priority:</span>
        <select
          value={filters.priority}
          onChange={(e) => updateFilter('priority', e.target.value)}
          className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2"
          style={{ 
            backgroundColor: 'color-mix(in srgb, var(--color-bg-secondary) 50%, transparent)',
            borderColor: 'color-mix(in srgb, var(--color-border) 50%, transparent)',
            color: 'var(--color-text-primary)',
            '--tw-ring-color': 'color-mix(in srgb, var(--color-accent) 50%, transparent)'
          }}
        >
          {PRIORITY_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="h-6 w-px" style={{ backgroundColor: 'color-mix(in srgb, var(--color-border) 50%, transparent)' }} />

      {/* Sort */}
      <div className="flex items-center gap-2">
        <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Sort:</span>
        <select
          value={filters.sortBy}
          onChange={(e) => updateFilter('sortBy', e.target.value)}
          className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2"
          style={{ 
            backgroundColor: 'color-mix(in srgb, var(--color-bg-secondary) 50%, transparent)',
            borderColor: 'color-mix(in srgb, var(--color-border) 50%, transparent)',
            color: 'var(--color-text-primary)',
            '--tw-ring-color': 'color-mix(in srgb, var(--color-accent) 50%, transparent)'
          }}
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button
          onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
          className="p-1.5 rounded-lg transition-all"
          style={{ color: 'var(--color-text-secondary)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text-primary)'; e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-secondary)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
          title={filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        >
          {filters.sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>
    </div>
  );
}
