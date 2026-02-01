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
      className="p-4 bg-zinc-900/80 backdrop-blur-xl rounded-xl border border-zinc-700/50 space-y-4"
    >
      {/* Task Input */}
      <div>
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="What needs to be done?"
          className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
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
              priority === p.value
                ? `${p.color} text-white shadow-lg`
                : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-200'
            }`}
          >
            <span>{p.icon}</span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Due Date */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="block text-sm text-zinc-400 mb-1.5 font-medium">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>
        
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="mt-6 text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          {showAdvanced ? 'Less options' : 'More options'}
        </button>
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="space-y-4 pt-4 border-t border-zinc-700/50">
          {/* Recurring */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5 font-medium">Repeat</label>
            <select
              value={recurring}
              onChange={(e) => setRecurring(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              {RECURRING_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5 font-medium">Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="work, important, project"
              className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!task.trim()}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg hover:from-purple-500 hover:to-violet-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
        >
          {todo ? 'Update' : 'Add Todo'}
        </button>
      </div>
    </form>
  );
}
