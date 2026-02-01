'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { MarkdownEditor } from './MarkdownEditor';
import { MarkdownPreview } from './MarkdownPreview';
import { EditorModeSelector } from './EditorModeSelector';
import { formatDate, countWords, countCharacters, estimateReadingTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const editorModeConfig = {
  edit: { icon: '✏️', label: 'Edit' },
  preview: { icon: '👁️', label: 'Preview' },
  split: { icon: '◫', label: 'Split' },
  focus: { icon: '🎯', label: 'Focus' },
  zen: { icon: '🧘', label: 'Zen' },
  typewriter: { icon: '⌨️', label: 'Typewriter' },
  reading: { icon: '📖', label: 'Reading' },
};

export function NoteEditor({ onSave }) {
  const {
    currentNote,
    editorContent,
    setEditorContent,
    editorMode,
    setEditorMode,
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    settings,
    updateNote,
    sidebarOpen,
    setSidebarOpen,
  } = useAppStore();
  
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);

  const wordCount = countWords(editorContent);
  const charCount = countCharacters(editorContent);
  const readingTime = estimateReadingTime(wordCount);

  const getSaveStatus = () => {
    if (isSaving) return { text: 'Saving...', icon: '⟳', className: 'animate-spin' };
    if (hasUnsavedChanges) return { text: 'Unsaved', icon: '●', className: 'text-yellow-400' };
    if (lastSaved) return { text: 'Saved', icon: '✓', className: 'text-green-400' };
    return { text: 'Ready', icon: '○', className: '' };
  };

  const saveStatus = getSaveStatus();

  const handleToggleFavorite = async () => {
    if (!currentNote || isTogglingFavorite) return;
    
    setIsTogglingFavorite(true);
    try {
      const response = await fetch(`/api/notes/${currentNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: !currentNote.is_favorite }),
      });
      
      const data = await response.json();
      if (data.success) {
        updateNote(data.data);
        toast.success(data.data.is_favorite ? 'Added to favorites' : 'Removed from favorites');
      } else {
        toast.error('Failed to update');
      }
    } catch (error) {
      toast.error('Failed to update');
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  // Exit Zen mode
  const exitZenMode = () => {
    setEditorMode('edit');
    setSidebarOpen(true);
  };

  // Check if we're in a full-screen mode
  const isZenMode = editorMode === 'zen';
  const isFocusMode = editorMode === 'focus';
  const isReadingMode = editorMode === 'reading';
  const isTypewriterMode = editorMode === 'typewriter';
  const showPreview = ['preview', 'split', 'reading'].includes(editorMode);
  const showEditor = ['edit', 'split', 'focus', 'zen', 'typewriter'].includes(editorMode);

  if (!currentNote) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950">
        <div className="text-center p-8 rounded-xl bg-zinc-900 border border-zinc-700/50">
          <div className="text-5xl mb-4">🧠</div>
          <h3 className="text-lg font-bold text-zinc-100 mb-2">No note selected</h3>
          <p className="text-sm text-zinc-400 mb-4">
            Select a note from the sidebar or create a new one
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-purple-400">
            <span className="px-2 py-1 rounded bg-zinc-950 font-mono text-xs">⌘N</span>
            <span className="text-zinc-400">to create new note</span>
          </div>
        </div>
      </div>
    );
  }

  // Zen Mode: Full screen, minimal UI
  if (isZenMode) {
    return (
      <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col fade-in">
        {/* Minimal top bar */}
        <div className="absolute top-4 right-4 flex items-center gap-2 opacity-30 hover:opacity-100 transition-opacity">
          <span className={cn('text-xs', saveStatus.className)}>{saveStatus.icon}</span>
          <button
            onClick={exitZenMode}
            className="px-3 py-1 text-xs text-zinc-400 hover:text-purple-400 bg-zinc-900 rounded-lg"
          >
            Exit Zen (Esc)
          </button>
        </div>
        
        {/* Centered editor */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-2xl h-full">
            <MarkdownEditor
              content={editorContent}
              onChange={setEditorContent}
              onSave={onSave}
              noteId={currentNote.id}
              noteTitle={currentNote.title}
              className="text-lg leading-relaxed"
            />
          </div>
        </div>
        
        {/* Minimal word count */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-zinc-400 opacity-30 hover:opacity-100 transition-opacity">
          {wordCount} words · {readingTime}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex-1 flex flex-col bg-zinc-950 h-full",
      isFocusMode && "max-w-3xl mx-auto"
    )}>
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-700/50 bg-zinc-900">
        {/* Left: Note Info */}
        <div className="flex items-center gap-3 min-w-0">
          <h2 className="font-semibold text-zinc-100 truncate max-w-[200px]">
            {currentNote.title || 'Untitled'}
          </h2>
          <button
            onClick={handleToggleFavorite}
            disabled={isTogglingFavorite}
            className={cn(
              "text-base transition-all hover:scale-110",
              currentNote.is_favorite ? "text-yellow-400" : "text-zinc-400 hover:text-yellow-400"
            )}
            title={currentNote.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {currentNote.is_favorite ? '⭐' : '☆'}
          </button>
        </div>

        {/* Center: Mode Toggle */}
        <div className="relative">
          <div className="flex items-center gap-0.5 bg-zinc-950 rounded-lg p-0.5">
            {['edit', 'split', 'preview'].map((mode) => (
              <button
                key={mode}
                onClick={() => setEditorMode(mode)}
                className={cn(
                  'px-3 py-1.5 text-xs rounded-md transition-all font-medium flex items-center gap-1',
                  editorMode === mode
                    ? 'bg-purple-600 text-white'
                    : 'text-zinc-400 hover:text-zinc-100'
                )}
              >
                <span>{editorModeConfig[mode].icon}</span>
                <span className="hidden sm:inline">{editorModeConfig[mode].label}</span>
              </button>
            ))}
            
            {/* More modes dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowModeMenu(!showModeMenu)}
                className={cn(
                  'px-2 py-1.5 text-xs rounded-md transition-all',
                  ['focus', 'zen', 'typewriter', 'reading'].includes(editorMode)
                    ? 'bg-purple-600 text-white'
                    : 'text-zinc-400 hover:text-zinc-100'
                )}
              >
                ⋯
              </button>
              
              {showModeMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowModeMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-36 bg-zinc-900 border border-zinc-700/50 rounded-lg shadow-xl z-50 py-1 fade-in">
                    {['focus', 'zen', 'typewriter', 'reading'].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => {
                          setEditorMode(mode);
                          setShowModeMenu(false);
                          if (mode === 'zen') setSidebarOpen(false);
                        }}
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors',
                          editorMode === mode
                            ? 'bg-purple-500/10 text-purple-400'
                            : 'text-zinc-400 hover:bg-zinc-800'
                        )}
                      >
                        <span>{editorModeConfig[mode].icon}</span>
                        <span>{editorModeConfig[mode].label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Save Status */}
        <div className="flex items-center gap-2 text-xs">
          <span className={saveStatus.className}>{saveStatus.icon}</span>
          <span className="text-zinc-400 hidden sm:inline">{saveStatus.text}</span>
        </div>
      </div>

      {/* Editor Content */}
      <div className={cn(
        "flex-1 flex overflow-auto",
        isReadingMode && "max-w-2xl mx-auto"
      )}>
        {/* Edit/Focus/Typewriter Mode */}
        {showEditor && !showPreview && (
          <div className={cn(
            "flex-1 h-full",
            isTypewriterMode && "typewriter-mode"
          )}>
            <MarkdownEditor
              content={editorContent}
              onChange={setEditorContent}
              onSave={onSave}
              noteId={currentNote.id}
              noteTitle={currentNote.title}
              className={cn(
                isFocusMode && "text-lg leading-relaxed",
                isTypewriterMode && "text-lg"
              )}
            />
          </div>
        )}

        {/* Preview/Reading Mode */}
        {showPreview && !showEditor && (
          <div className="flex-1 overflow-auto">
            <MarkdownPreview 
              content={editorContent} 
              className={isReadingMode ? "prose-lg leading-loose" : ""}
            />
          </div>
        )}

        {/* Split Mode */}
        {showEditor && showPreview && (
          <>
            <div className="flex-1 h-full border-r border-zinc-700/50">
              <MarkdownEditor
                content={editorContent}
                onChange={setEditorContent}
                onSave={onSave}
                noteId={currentNote.id}
                noteTitle={currentNote.title}
              />
            </div>
            <div className="flex-1 overflow-auto">
              <MarkdownPreview content={editorContent} />
            </div>
          </>
        )}
      </div>

      {/* Footer Stats */}
      {settings.show_word_count && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-700/50 bg-zinc-900 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-zinc-400">{wordCount} words</span>
            <span className="text-zinc-400">{charCount} chars</span>
            <span className="text-zinc-400">{readingTime}</span>
          </div>
          <div className="flex items-center gap-3">
            {currentNote.tags.length > 0 && (
              <div className="flex items-center gap-1">
                {currentNote.tags.slice(0, 3).map((t) => (
                  <span key={t} className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[10px]">
                    #{t}
                  </span>
                ))}
                {currentNote.tags.length > 3 && (
                  <span className="text-zinc-400">+{currentNote.tags.length - 3}</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
