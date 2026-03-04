'use client';

import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const editorModes = [
  { id: 'edit', icon: '✏️', label: 'Edit', description: 'Standard editing mode' },
  { id: 'preview', icon: '👁️', label: 'Preview', description: 'Markdown preview' },
  { id: 'split', icon: '◫', label: 'Split', description: 'Side-by-side editor and preview' },
  { id: 'focus', icon: '🎯', label: 'Focus', description: 'Distraction-free with centered content' },
  { id: 'zen', icon: '🧘', label: 'Zen', description: 'Minimal UI, maximum focus' },
  { id: 'typewriter', icon: '⌨️', label: 'Typewriter', description: 'Keep cursor at center' },
  { id: 'reading', icon: '📖', label: 'Reading', description: 'Optimized for reading' },
];

export function EditorModeSelector({ compact = false }) {
  const { editorMode, setEditorMode } = useAppStore();

  if (compact) {
    return (
      <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>
        {editorModes.slice(0, 4).map((mode) => (
          <button
            key={mode.id}
            onClick={() => setEditorMode(mode.id)}
            title={mode.label}
            className="px-2 py-1 text-sm rounded transition-all duration-200"
            style={editorMode === mode.id
              ? { backgroundColor: 'var(--color-accent)', color: '#fff' }
              : { color: 'var(--color-text-muted)' }
            }
          >
            {mode.icon}
          </button>
        ))}
        <div className="relative group">
          <button
            className="px-2 py-1 text-sm rounded transition-all duration-200"
            style={['focus', 'zen', 'typewriter', 'reading'].includes(editorMode)
              ? { backgroundColor: 'var(--color-accent)', color: '#fff' }
              : { color: 'var(--color-text-muted)' }
            }
          >
            ⋯
          </button>
          <div className="absolute right-0 top-full mt-1 w-40 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50" style={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}>
            {editorModes.slice(3).map((mode) => (
              <button
                key={mode.id}
                onClick={() => setEditorMode(mode.id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors"
                style={editorMode === mode.id
                  ? { backgroundColor: 'color-mix(in srgb, var(--color-accent) 10%, transparent)', color: 'var(--color-accent-muted)' }
                  : { color: 'var(--color-text-muted)' }
                }
              >
                <span>{mode.icon}</span>
                <span>{mode.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Editor Mode</h3>
      <div className="grid grid-cols-2 gap-2">
        {editorModes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setEditorMode(mode.id)}
            className="flex flex-col items-start p-3 rounded-xl border-2 transition-all duration-200 text-left"
            style={editorMode === mode.id
              ? { borderColor: 'var(--color-accent)', backgroundColor: 'color-mix(in srgb, var(--color-accent) 10%, transparent)' }
              : { borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }
            }
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{mode.icon}</span>
              <span className="text-sm font-medium" style={{ color: editorMode === mode.id ? 'var(--color-accent-muted)' : 'var(--color-text-primary)' }}>
                {mode.label}
              </span>
            </div>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {mode.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Hook to get mode-specific styles
export function useEditorModeStyles() {
  const { editorMode } = useAppStore();

  const containerStyles = cn(
    'transition-all duration-300',
    {
      // Focus mode - centered, narrow content
      'max-w-2xl mx-auto': editorMode === 'focus',
      // Zen mode - fullscreen, no chrome
      'fixed inset-0 z-50 p-8': editorMode === 'zen',
      // Typewriter mode - keep cursor centered
      'typewriter-mode': editorMode === 'typewriter',
      // Reading mode - wider line spacing, serif font
      'max-w-2xl mx-auto leading-relaxed': editorMode === 'reading',
    }
  );

  const editorStyles = cn(
    'transition-all duration-300',
    {
      'text-lg': editorMode === 'focus' || editorMode === 'zen',
      'font-serif text-lg leading-loose': editorMode === 'reading',
    }
  );

  const showToolbar = !['zen'].includes(editorMode);
  const showSidebar = !['zen', 'focus'].includes(editorMode);
  const showPreview = ['preview', 'split', 'reading'].includes(editorMode);
  const showEditor = ['edit', 'split', 'focus', 'zen', 'typewriter'].includes(editorMode);

  return {
    editorMode,
    containerStyles,
    editorStyles,
    showToolbar,
    showSidebar,
    showPreview,
    showEditor,
  };
}
