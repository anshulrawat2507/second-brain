'use client';

import { useState } from 'react';

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-gray-500', icon: '○' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-500', icon: '◐' },
  { value: 'high', label: 'High', color: 'bg-orange-500', icon: '●' },
  { value: 'critical', label: 'Critical', color: 'bg-red-500', icon: '⚠' }
];

const RECURRING_OPTIONS = [
  { value: 'none', label: 'No repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
];

export function TodoForm({ todo, onSubmit, onCancel }) {
  const [task, setTask] = useState(todo?.task || '');
  const [priority, setPriority] = useState(todo?.priority || 'medium');
  const [dueDate, setDueDate] = useState(todo?.due_date ? todo.due_date.split('T')[0] : '');
  const [recurring, setRecurring] = useState(todo?.recurring || 'none');
  const [tags, setTags] = useState(todo?.tags?.join(', ') || '');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!task.trim()) return;

    const todoData = {
      task: task.trim(),
      priority,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      recurring,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean)
    };

    onSubmit(todoData);
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="p-4 backdrop-blur-xl rounded-xl border space-y-4"
      style={{ 
        backgroundColor: 'color-mix(in srgb, var(--color-bg-secondary) 80%, transparent)',
        borderColor: 'color-mix(in srgb, var(--color-border) 50%, transparent)'
      }}
    >
      {/* Task Input */}
      <div>
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="What needs to be done?"
          className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all"
          style={{ 
            backgroundColor: 'color-mix(in srgb, var(--color-bg-secondary) 50%, transparent)',
            borderColor: 'color-mix(in srgb, var(--color-border) 50%, transparent)',
            color: 'var(--color-text-primary)',
            '--tw-ring-color': 'color-mix(in srgb, var(--color-accent) 50%, transparent)'
          }}
          autoFocus
        />
      </div>

      {/* Priority Selection */}
      <div className="flex flex-wrap gap-2">
        {PRIORITIES.map(p => (
          <button
            key={p.value}
            type="button"
            onClick={() => setPriority(p.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              priority === p.value ? `${p.color} text-white shadow-lg` : ''
            }`}
            style={priority !== p.value ? { 
              backgroundColor: 'color-mix(in srgb, var(--color-bg-secondary) 50%, transparent)',
              color: 'var(--color-text-secondary)'
            } : {}}
            onMouseEnter={(e) => {
              if (priority !== p.value) {
                e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-bg-elevated) 50%, transparent)';
                e.currentTarget.style.color = 'var(--color-text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (priority !== p.value) {
                e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-bg-secondary) 50%, transparent)';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
              }
            }}
          >
            <span>{p.icon}</span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Due Date */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="block text-sm mb-1.5 font-medium" style={{ color: 'var(--color-text-secondary)' }}>Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
            style={{ 
              backgroundColor: 'color-mix(in srgb, var(--color-bg-secondary) 50%, transparent)',
              borderColor: 'color-mix(in srgb, var(--color-border) 50%, transparent)',
              color: 'var(--color-text-primary)',
              '--tw-ring-color': 'color-mix(in srgb, var(--color-accent) 50%, transparent)'
            }}
          />
        </div>
        
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="mt-6 text-sm transition-colors"
          style={{ color: 'var(--color-accent-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-accent-muted)'; }}
        >
          {showAdvanced ? 'Less options' : 'More options'}
        </button>
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="space-y-4 pt-4 border-t" style={{ borderColor: 'color-mix(in srgb, var(--color-border) 50%, transparent)' }}>
          {/* Recurring */}
          <div>
            <label className="block text-sm mb-1.5 font-medium" style={{ color: 'var(--color-text-secondary)' }}>Repeat</label>
            <select
              value={recurring}
              onChange={(e) => setRecurring(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: 'color-mix(in srgb, var(--color-bg-secondary) 50%, transparent)',
                borderColor: 'color-mix(in srgb, var(--color-border) 50%, transparent)',
                color: 'var(--color-text-primary)',
                '--tw-ring-color': 'color-mix(in srgb, var(--color-accent) 50%, transparent)'
              }}
            >
              {RECURRING_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm mb-1.5 font-medium" style={{ color: 'var(--color-text-secondary)' }}>Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="work, important, project"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: 'color-mix(in srgb, var(--color-bg-secondary) 50%, transparent)',
                borderColor: 'color-mix(in srgb, var(--color-border) 50%, transparent)',
                color: 'var(--color-text-primary)',
                '--tw-ring-color': 'color-mix(in srgb, var(--color-accent) 50%, transparent)'
              }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 transition-colors"
          style={{ color: 'var(--color-text-secondary)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text-primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!task.trim()}
          className="px-4 py-2 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ 
            backgroundColor: 'var(--color-accent)',
            boxShadow: '0 10px 15px -3px color-mix(in srgb, var(--color-accent) 20%, transparent)'
          }}
        >
          {todo ? 'Update' : 'Add Todo'}
        </button>
      </div>
    </form>
  );
}
