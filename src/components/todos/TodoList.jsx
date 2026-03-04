'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { TodoItem } from './TodoItem';
import { TodoForm } from './TodoForm';
import { TodoFilters } from './TodoFilters';

export function TodoList() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'active',
    priority: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);

  const fetchTodos = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.priority) params.set('priority', filters.priority);
      if (filters.sortBy) params.set('sortBy', filters.sortBy);
      if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

      const response = await fetch(`/api/todos?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setTodos(result.data);
      } else {
        toast.error(result.error || 'Failed to fetch todos');
      }
    } catch (error) {
      toast.error('Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleCreate = async (todoData) => {
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todoData)
      });
      const result = await response.json();

      if (result.success) {
        setTodos(prev => [result.data, ...prev]);
        setShowForm(false);
        toast.success('Todo created!');
      } else {
        toast.error(result.error || 'Failed to create todo');
      }
    } catch (error) {
      toast.error('Failed to create todo');
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const result = await response.json();

      if (result.success) {
        setTodos(prev => prev.map(t => t.id === id ? result.data : t));
        setEditingTodo(null);
        
        // If archived, remove from list if not viewing archived
        if (updates.is_archived && filters.status !== 'archived') {
          setTodos(prev => prev.filter(t => t.id !== id));
        }
      } else {
        toast.error(result.error || 'Failed to update todo');
      }
    } catch (error) {
      toast.error('Failed to update todo');
    }
  };

  const handleToggle = async (id, completed) => {
    await handleUpdate(id, { completed });
    if (completed && filters.status === 'active') {
      // Optionally remove from active list after a delay
      setTimeout(() => {
        setTodos(prev => prev.filter(t => t.id !== id));
      }, 1000);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this todo and all its subtasks?')) return;

    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();

      if (result.success) {
        setTodos(prev => prev.filter(t => t.id !== id));
        toast.success('Todo deleted');
      } else {
        toast.error(result.error || 'Failed to delete todo');
      }
    } catch (error) {
      toast.error('Failed to delete todo');
    }
  };

  const handleAddSubtask = async (parentId, subtaskData) => {
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...subtaskData, parent_id: parentId })
      });
      const result = await response.json();

      if (result.success) {
        setTodos(prev => prev.map(t => {
          if (t.id === parentId) {
            return { ...t, subtasks: [...(t.subtasks || []), result.data] };
          }
          return t;
        }));
        toast.success('Subtask added!');
      } else {
        toast.error(result.error || 'Failed to add subtask');
      }
    } catch (error) {
      toast.error('Failed to add subtask');
    }
  };

  const handleArchive = (id) => {
    handleUpdate(id, { is_archived: true });
    toast.success('Todo archived');
  };

  // Calculate progress
  const totalTodos = todos.length;
  const completedTodos = todos.filter(t => t.completed).length;
  const progressPercent = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div 
            className="inline-block w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mb-4"
            style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }}
          ></div>
          <p style={{ color: 'var(--color-text-muted)' }}>Loading todos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl">✓</div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Todos</h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {completedTodos} of {totalTodos} completed
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 text-white rounded-xl transition-all flex items-center gap-2"
          style={{ 
            backgroundColor: 'var(--color-accent)',
            boxShadow: '0 10px 15px -3px color-mix(in srgb, var(--color-accent) 20%, transparent)'
          }}
        >
          <span>+</span>
          <span>Add Todo</span>
        </button>
      </div>

      {/* Progress Bar */}
      {totalTodos > 0 && (
        <div className="rounded-full h-2 overflow-hidden" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          <div 
            className="h-full transition-all duration-500"
            style={{ width: `${progressPercent}%`, backgroundColor: 'var(--color-accent)' }}
          />
        </div>
      )}

      {/* Filters */}
      <TodoFilters filters={filters} onChange={setFilters} />

      {/* Add Todo Form */}
      {showForm && (
        <TodoForm 
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Todo List */}
      <div className="space-y-3">
        {todos.length === 0 ? (
          <div 
            className="text-center py-12 rounded-xl border"
            style={{ 
              backgroundColor: 'color-mix(in srgb, var(--color-bg-secondary) 50%, transparent)',
              borderColor: 'color-mix(in srgb, var(--color-border) 50%, transparent)'
            }}
          >
            <div className="text-4xl mb-4">📋</div>
            <p style={{ color: 'var(--color-text-muted)' }}>
              {filters.status === 'archived' 
                ? 'No archived todos' 
                : filters.status === 'completed'
                  ? 'No completed todos'
                  : 'No todos yet. Create your first one!'}
            </p>
          </div>
        ) : (
          todos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={handleToggle}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onArchive={handleArchive}
              onAddSubtask={handleAddSubtask}
              isEditing={editingTodo === todo.id}
              onEdit={() => setEditingTodo(todo.id)}
              onCancelEdit={() => setEditingTodo(null)}
            />
          ))
        )}
      </div>
    </div>
  );
}
