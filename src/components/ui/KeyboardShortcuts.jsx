'use client';

import { cn } from '@/lib/utils';

const shortcuts = [
  {
    category: 'General',
    items: [
      { keys: ['⌘', 'K'], description: 'Open search' },
      { keys: ['⌘', 'P'], description: 'Command palette' },
      { keys: ['⌘', 'N'], description: 'New note' },
      { keys: ['⌘', 'S'], description: 'Save note' },
      { keys: ['⌘', '/'], description: 'Toggle sidebar' },
      { keys: ['?'], description: 'Show keyboard shortcuts' },
    ],
  },
  {
    category: 'Navigation',
    items: [
      { keys: ['⌘', 'J'], description: 'Open daily journal' },
      { keys: ['⌘', 'G'], description: 'Open knowledge graph' },
      { keys: ['⌘', 'T'], description: 'Open templates' },
      { keys: ['⌘', 'L'], description: 'Saved links & embeds' },
      { keys: ['⌘', 'H'], description: 'Version history' },
    ],
  },
  {
    category: 'Editor',
    items: [
      { keys: ['⌘', 'B'], description: 'Bold text' },
      { keys: ['⌘', 'I'], description: 'Italic text' },
      { keys: ['⌘', 'U'], description: 'Underline text' },
      { keys: ['⌘', 'Shift', 'K'], description: 'Code block' },
      { keys: ['⌘', 'Shift', 'X'], description: 'Strikethrough' },
    ],
  },
  {
    category: 'Editor Modes',
    items: [
      { keys: ['⌘', '1'], description: 'Edit mode' },
      { keys: ['⌘', '2'], description: 'Preview mode' },
      { keys: ['⌘', '3'], description: 'Split mode' },
      { keys: ['⌘', '4'], description: 'Focus mode' },
      { keys: ['⌘', '5'], description: 'Zen mode' },
    ],
  },
  {
    category: 'Notes',
    items: [
      { keys: ['⌘', 'Shift', 'F'], description: 'Toggle favorite' },
      { keys: ['⌘', 'Shift', 'D'], description: 'Duplicate note' },
      { keys: ['⌘', 'Shift', 'E'], description: 'Export note' },
      { keys: ['Delete'], description: 'Move to trash' },
    ],
  },
];

export function KeyboardShortcuts({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 rounded-2xl shadow-2xl w-full max-w-2xl pointer-events-auto max-h-[85vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-700/50">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⌨️</span>
              <h2 className="text-lg font-bold text-zinc-100">
                Keyboard Shortcuts
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-6">
              {shortcuts.map((section) => (
                <div key={section.category}>
                  <h3 className="text-sm font-medium text-purple-400 mb-3">
                    {section.category}
                  </h3>
                  <div className="space-y-2">
                    {section.items.map((shortcut, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between py-1"
                      >
                        <span className="text-sm text-zinc-400">
                          {shortcut.description}
                        </span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, i) => (
                            <span key={i}>
                              <kbd className="px-2 py-1 text-xs bg-zinc-800 text-zinc-100 rounded border border-zinc-700 font-mono">
                                {key}
                              </kbd>
                              {i < shortcut.keys.length - 1 && (
                                <span className="text-zinc-500 mx-0.5">+</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-zinc-700/50 bg-zinc-800/30 text-center">
            <p className="text-xs text-zinc-500">
              Press <kbd className="px-1.5 py-0.5 text-xs bg-zinc-800 text-zinc-100 rounded border border-zinc-700">?</kbd> anytime to show this help
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
