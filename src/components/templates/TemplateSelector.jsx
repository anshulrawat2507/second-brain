'use client';

import { useState, useEffect } from 'react';
import { Modal, Button, Input } from '@/components/ui';
import toast from 'react-hot-toast';

// Common emoji icons for templates
const TEMPLATE_ICONS = ['📝', '📋', '📔', '🚀', '✅', '💡', '📅', '📚', '🎯', '📊', '💼', '🔬', '📖', '🗓️', '📌', '🔖'];

export function TemplateSelector({ isOpen, onClose, onSelect }) {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'builtin', 'custom'

  // Form state
  const [formName, setFormName] = useState('');
  const [formIcon, setFormIcon] = useState('📝');
  const [formContent, setFormContent] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/templates');
      const data = await response.json();
      if (data.success) {
        setTemplates(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (template) => {
    onSelect(template.content, template.name);
    onClose();
  };

  const handleCreate = async () => {
    if (!formName.trim() || !formContent.trim()) {
      toast.error('Name and content are required');
      return;
    }

    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          icon: formIcon,
          content: formContent
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Template created!');
        setShowCreateModal(false);
        resetForm();
        fetchTemplates();
      } else {
        toast.error(data.error || 'Failed to create template');
      }
    } catch (error) {
      toast.error('Failed to create template');
    }
  };

  const handleEdit = async () => {
    if (!formName.trim() || !formContent.trim()) {
      toast.error('Name and content are required');
      return;
    }

    try {
      const response = await fetch(`/api/templates/${editingTemplate.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          icon: formIcon,
          content: formContent
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Template updated!');
        setShowEditModal(false);
        resetForm();
        fetchTemplates();
      } else {
        toast.error(data.error || 'Failed to update template');
      }
    } catch (error) {
      toast.error('Failed to update template');
    }
  };

  const handleDelete = async (template) => {
    if (!confirm(`Delete "${template.name}"? This cannot be undone.`)) return;

    try {
      const response = await fetch(`/api/templates/${template.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Template deleted');
        fetchTemplates();
      } else {
        toast.error(data.error || 'Failed to delete template');
      }
    } catch (error) {
      toast.error('Failed to delete template');
    }
  };

  const startEdit = (template) => {
    setEditingTemplate(template);
    setFormName(template.name);
    setFormIcon(template.icon);
    setFormContent(template.content);
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormName('');
    setFormIcon('📝');
    setFormContent('');
    setEditingTemplate(null);
  };

  const filteredTemplates = templates.filter(t => {
    if (filter === 'builtin') return t.is_builtin;
    if (filter === 'custom') return !t.is_builtin;
    return true;
  });

  const builtinCount = templates.filter(t => t.is_builtin).length;
  const customCount = templates.filter(t => !t.is_builtin).length;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Choose a Template" size="xl">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-zinc-700/50">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === 'all' 
                ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/20' 
                : 'bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All ({templates.length})
          </button>
          <button
            onClick={() => setFilter('builtin')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === 'builtin' 
                ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/20' 
                : 'bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Built-in ({builtinCount})
          </button>
          <button
            onClick={() => setFilter('custom')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === 'custom' 
                ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/20' 
                : 'bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            My Templates ({customCount})
          </button>
          <div className="flex-1" />
          <Button onClick={() => { resetForm(); setShowCreateModal(true); }}>
            + New Template
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-zinc-400">
            <div className="inline-block w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p>Loading templates...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-8 text-zinc-400">
            {filter === 'custom' ? (
              <>
                <div className="text-4xl mb-2">📄</div>
                <p className="font-medium">No custom templates yet</p>
                <p className="text-sm mt-1 text-zinc-500">Create your first template to get started</p>
              </>
            ) : (
              <p>No templates found</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent pr-1">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className={`relative group p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                  selectedId === template.id
                    ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10'
                    : 'border-zinc-700/50 hover:border-purple-500/50 hover:bg-zinc-800/50'
                }`}
              >
                <button
                  onClick={() => handleSelect(template)}
                  onMouseEnter={() => setSelectedId(template.id)}
                  onMouseLeave={() => setSelectedId(null)}
                  className="w-full text-left"
                >
                  <div className="text-2xl mb-2">{template.icon}</div>
                  <div className="font-medium text-zinc-200">{template.name}</div>
                  <div className="text-xs text-zinc-500 mt-1 flex items-center gap-2">
                    <span>{template.content.split('\n').length} lines</span>
                    {template.is_builtin && (
                      <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded text-[10px] font-medium">
                        Built-in
                      </span>
                    )}
                  </div>
                </button>

                {/* Edit/Delete buttons for custom templates */}
                {!template.is_builtin && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); startEdit(template); }}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-purple-600 text-zinc-400 hover:text-white transition-colors"
                      title="Edit template"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(template); }}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-600 text-zinc-400 hover:text-white transition-colors"
                      title="Delete template"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-zinc-700/50 flex justify-between items-center">
          <p className="text-xs text-zinc-500 flex items-center gap-2">
            <span className="text-purple-400">💡</span> 
            Use <code className="px-1.5 py-0.5 bg-zinc-800 rounded font-mono text-purple-400">{'{{date}}'}</code> for dynamic dates
          </p>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </Modal>

      {/* Create Template Modal */}
      <Modal 
        isOpen={showCreateModal} 
        onClose={() => { setShowCreateModal(false); resetForm(); }} 
        title="Create New Template" 
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex gap-4">
            {/* Icon Selector */}
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5 font-medium">Icon</label>
              <div className="relative">
                <button
                  className="w-12 h-12 text-2xl bg-zinc-800/50 border border-zinc-700/50 rounded-xl hover:border-purple-500/50 transition-colors"
                >
                  {formIcon}
                </button>
                <div className="absolute top-full left-0 mt-1 p-2 bg-zinc-900 border border-zinc-700/50 rounded-xl shadow-xl z-10 grid grid-cols-4 gap-1 w-max opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  {TEMPLATE_ICONS.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setFormIcon(icon)}
                      className={`p-2 text-lg rounded-lg transition-colors ${formIcon === icon ? 'bg-purple-600/20 ring-1 ring-purple-500' : 'hover:bg-zinc-800'}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Name Input */}
            <div className="flex-1">
              <Input
                label="Template Name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="My Custom Template"
              />
            </div>
          </div>

          {/* Content Textarea */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5 font-medium">Template Content</label>
            <textarea
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              placeholder="# Template Title&#10;&#10;Start writing your template content...&#10;&#10;Use {{date}}, {{time}}, {{datetime}} for dynamic values."
              rows={12}
              className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 font-mono text-sm resize-none transition-all"
            />
            <p className="text-xs text-zinc-500 mt-2 flex flex-wrap gap-2">
              <span className="text-zinc-400">Variables:</span>
              <code className="px-1.5 py-0.5 bg-zinc-800 rounded text-purple-400">{'{{date}}'}</code>
              <code className="px-1.5 py-0.5 bg-zinc-800 rounded text-purple-400">{'{{time}}'}</code>
              <code className="px-1.5 py-0.5 bg-zinc-800 rounded text-purple-400">{'{{datetime}}'}</code>
              <code className="px-1.5 py-0.5 bg-zinc-800 rounded text-purple-400">{'{{year}}'}</code>
              <code className="px-1.5 py-0.5 bg-zinc-800 rounded text-purple-400">{'{{month}}'}</code>
              <code className="px-1.5 py-0.5 bg-zinc-800 rounded text-purple-400">{'{{day}}'}</code>
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-zinc-700/50">
            <Button variant="secondary" onClick={() => { setShowCreateModal(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>
              Create Template
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Template Modal */}
      <Modal 
        isOpen={showEditModal} 
        onClose={() => { setShowEditModal(false); resetForm(); }} 
        title="Edit Template" 
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex gap-4">
            {/* Icon Selector */}
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5 font-medium">Icon</label>
              <div className="grid grid-cols-8 gap-1 p-2 bg-zinc-800/50 border border-zinc-700/50 rounded-xl">
                {TEMPLATE_ICONS.map(icon => (
                  <button
                    key={icon}
                    onClick={() => setFormIcon(icon)}
                    className={`p-2 text-lg rounded-lg transition-colors ${formIcon === icon ? 'bg-purple-600/20 ring-1 ring-purple-500' : 'hover:bg-zinc-700/50'}`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Input
            label="Template Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="My Custom Template"
          />

          {/* Content Textarea */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5 font-medium">Template Content</label>
            <textarea
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              rows={12}
              className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 font-mono text-sm resize-none transition-all"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-zinc-700/50">
            <Button variant="secondary" onClick={() => { setShowEditModal(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
