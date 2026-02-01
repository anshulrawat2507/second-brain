'use client';

import { useState } from 'react';
import { TodoForm } from './TodoForm';

const PRIORITY_STYLES = {
  low: { color: 'text-gray-400', bg: 'bg-gray-500/20', icon: '○' },
  medium: { color: 'text-blue-400', bg: 'bg-blue-500/20', icon: '◐' },
  high: { color: 'text-orange-400', bg: 'bg-orange-500/20', icon: '●' },
  critical: { color: 'text-red-400', bg: 'bg-red-500/20', icon: '⚠' }
};

function getDueDateStatus(dueDate) {
  if (!dueDate) return null;
  
  const now = new Date();
  const due = new Date(dueDate);
  const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { status: 'overdue', label: 'Overdue', color: 'text-red-500 bg-red-500/20' };
  if (diffDays === 0) return { status: 'today', label: 'Today', color: 'text-orange-500 bg-orange-500/20' };
  if (diffDays <= 3) return { status: 'soon', label: `${diffDays}d`, color: 'text-yellow-500 bg-yellow-500/20' };
  return { status: 'normal', label: formatDate(due), color: 'text-zinc-400 bg-zinc-800' };
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function TodoItem({ 
  todo, 
  onToggle, 
  onUpdate, 
  onDelete, 
  onArchive,
  onAddSubtask,
  isEditing,
  onEdit,
  onCancelEdit,
  isSubtask = false
}) {
  const [showSubtaskForm, setShowSubtaskForm] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const priority = PRIORITY_STYLES[todo.priority] || PRIORITY_STYLES.medium;
  const dueDateStatus = getDueDateStatus(todo.due_date);
  const hasSubtasks = todo.subtasks && todo.subtasks.length > 0;
  const completedSubtasks = hasSubtasks ? todo.subtasks.filter(s => s.completed).length : 0;

  if (isEditing) {
    return (
      <TodoForm 
        todo={todo}
        onSubmit={(data) => onUpdate(todo.id, data)}
        onCancel={onCancelEdit}
      />
    );
  }

  return (
    <div className={`group ${isSubtask ? '' : 'bg-zinc-900/50 rounded-xl border border-zinc-700/50 overflow-hidden hover:border-zinc-600/50 transition-all'}`}>
      {/* Main Todo Row */}
      <div className={`flex items-start gap-3 p-4 ${todo.completed ? 'opacity-60' : ''}`}>
        {/* Checkbox */}
        <button
          onClick={() => onToggle(todo.id, !todo.completed)}
          className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
            todo.completed
              ? 'bg-gradient-to-r from-purple-600 to-violet-600 border-purple-600 text-white'
              : 'border-zinc-600 hover:border-purple-500'
          }`}
        >
          {todo.completed && <span className="text-xs">✓</span>}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Task text */}
          <p className={`text-zinc-200 ${todo.completed ? 'line-through text-zinc-500' : ''}`}>
            {todo.task}
          </p>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {/* Priority */}
            <span className={`text-xs px-2 py-0.5 rounded-full ${priority.bg} ${priority.color}`}>
              {priority.icon} {todo.priority}
            </span>

            {/* Due date */}
            {dueDateStatus && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${dueDateStatus.color}`}>
                📅 {dueDateStatus.label}
              </span>
            )}

            {/* Recurring */}
            {todo.recurring !== 'none' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                🔄 {todo.recurring}
              </span>
            )}

            {/* Subtask count */}
            {hasSubtasks && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                📋 {completedSubtasks}/{todo.subtasks.length}
              </span>
            )}

            {/* Tags */}
            {todo.tags && todo.tags.map(tag => (
              <span 
                key={tag} 
                className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isSubtask && (
            <>
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-all"
                title={expanded ? 'Collapse' : 'Expand'}
              >
                {expanded ? '▼' : '▶'}
              </button>
              <button
                onClick={() => setShowSubtaskForm(true)}
                className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-all"
                title="Add subtask"
              >
                +
              </button>
            </>
          )}
          <button
            onClick={onEdit}
            className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-all"
            title="Edit"
          >
            ✏️
          </button>
          {!isSubtask && (
            <button
              onClick={() => onArchive(todo.id)}
              className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-all"
              title="Archive"
            >
              📦
            </button>
          )}
          <button
            onClick={() => onDelete(todo.id)}
            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Subtasks */}
      {!isSubtask && expanded && (hasSubtasks || showSubtaskForm) && (
        <div className="border-t border-zinc-700/30 bg-zinc-800/30">
          {/* Subtask list */}
          {todo.subtasks?.map(subtask => (
            <div key={subtask.id} className="pl-8 border-b border-zinc-700/20 last:border-b-0">
              <TodoItem
                todo={subtask}
                onToggle={onToggle}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onArchive={onArchive}
                isSubtask={true}
                isEditing={false}
                onEdit={() => {}}
                onCancelEdit={() => {}}
              />
            </div>
          ))}

          {/* Add subtask form */}
          {showSubtaskForm && (
            <div className="p-4 pl-8">
              <SubtaskInput
                onSubmit={(task) => {
                  onAddSubtask(todo.id, { task, priority: 'medium' });
                  setShowSubtaskForm(false);
                }}
                onCancel={() => setShowSubtaskForm(false)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SubtaskInput({ onSubmit, onCancel }) {
  const [task, setTask] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (task.trim()) {
      onSubmit(task.trim());
      setTask('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={task}
        onChange={(e) => setTask(e.target.value)}
        placeholder="Add subtask..."
        className="flex-1 px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
        autoFocus
      />
      <button
        type="submit"
        disabled={!task.trim()}
        className="px-3 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg hover:from-purple-500 hover:to-violet-500 text-sm disabled:opacity-50"
      >
        Add
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="px-3 py-2 text-zinc-400 hover:text-zinc-200 text-sm"
      >
        Cancel
      </button>
    </form>
  );
}
