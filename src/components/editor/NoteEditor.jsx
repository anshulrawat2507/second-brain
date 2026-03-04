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
  const [showFolderPicker, setShowFolderPicker] = useState(false);

  const wordCount = countWords(editorContent);
  const charCount = countCharacters(editorContent);
  const readingTime = estimateReadingTime(wordCount);

  // Get folders from store
  const folders = useAppStore((s) => s.folders);

  // Current folder for the note
  const currentFolder = currentNote?.folder_id ? folders.find(f => f.id === currentNote.folder_id) : null;

  // Move note to folder
  const handleMoveToFolder = async (folderId) => {
    if (!currentNote) return;
    try {
      const response = await fetch(`/api/notes/${currentNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder_id: folderId }),
      });
      const data = await response.json();
      if (data.success) {
        updateNote(data.data);
        const folderName = folderId ? folders.find(f => f.id === folderId)?.name : null;
        toast.success(folderId ? `Moved to "${folderName}"` : 'Moved to Loose Notes');
      } else {
        toast.error('Failed to move note');
      }
    } catch (error) {
      toast.error('Failed to move note');
    } finally {
      setShowFolderPicker(false);
    }
  };

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
      <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="text-center p-8 rounded-xl" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <div className="text-5xl mb-4">🧠</div>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>No note selected</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
            Select a note from the sidebar or create a new one
          </p>
          <div className="flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--color-accent)' }}>
            <span className="px-2 py-1 rounded font-mono text-xs" style={{ backgroundColor: 'var(--color-bg-primary)' }}>Ctrl+N</span>
            <span style={{ color: 'var(--color-text-tertiary)' }}>to create new note</span>
          </div>
        </div>
      </div>
    );
  }

  // Zen Mode: Full screen, minimal UI
  if (isZenMode) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col fade-in" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        {/* Minimal top bar */}
        <div className="absolute top-4 right-4 flex items-center gap-2 opacity-30 hover:opacity-100 transition-opacity">
          <span className={cn('text-xs', saveStatus.className)}>{saveStatus.icon}</span>
          <button
            onClick={exitZenMode}
            className="px-3 py-1 text-xs rounded-lg"
            style={{ color: 'var(--color-text-tertiary)', backgroundColor: 'var(--color-bg-secondary)' }}
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
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs opacity-30 hover:opacity-100 transition-opacity" style={{ color: 'var(--color-text-tertiary)' }}>
          {wordCount} words · {readingTime}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex-1 flex flex-col h-full",
      isFocusMode && "max-w-3xl mx-auto"
    )} style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
        {/* Left: Note Info */}
        <div className="flex items-center gap-3 min-w-0">
          <h2 className="font-semibold truncate max-w-[200px]" style={{ color: 'var(--color-text-primary)' }}>
            {currentNote.title || 'Untitled'}
          </h2>
          <button
            onClick={handleToggleFavorite}
            disabled={isTogglingFavorite}
            className={cn(
              "text-base transition-all hover:scale-110",
              currentNote.is_favorite ? "text-yellow-400" : "hover:text-yellow-400"
            )}
            style={{ color: currentNote.is_favorite ? undefined : 'var(--color-text-tertiary)' }}
            title={currentNote.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {currentNote.is_favorite ? '⭐' : '☆'}
          </button>

          {/* Folder Picker */}
          <div className="relative">
            <button
              onClick={() => setShowFolderPicker(!showFolderPicker)}
              className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md transition-colors"
              style={{
                backgroundColor: currentFolder ? 'var(--color-accent-muted)' : 'var(--color-bg-primary)',
                color: currentFolder ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
              }}
              onMouseEnter={e => { if (!currentFolder) e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'; }}
              onMouseLeave={e => { if (!currentFolder) e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)'; }}
              title="Move to folder"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
              <span className="hidden sm:inline truncate max-w-[100px]">{currentFolder ? currentFolder.name : 'No folder'}</span>
            </button>

            {showFolderPicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowFolderPicker(false)} />
                <div
                  className="absolute left-0 top-full mt-1 z-50 w-44 rounded-lg shadow-xl py-1 fade-in"
                  style={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}
                >
                  <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                    Move to
                  </p>
                  {/* Remove from folder option */}
                  {currentNote.folder_id && (
                    <button
                      onClick={() => handleMoveToFolder(null)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors"
                      style={{ color: 'var(--color-text-secondary)' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                      <span>Loose Notes</span>
                    </button>
                  )}
                  {/* Folder list */}
                  {folders.filter(f => f.id !== currentNote.folder_id).map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => handleMoveToFolder(folder.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors"
                      style={{ color: 'var(--color-text-secondary)' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                      <span className="truncate">{folder.name}</span>
                    </button>
                  ))}
                  {folders.length === 0 && (
                    <p className="px-3 py-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>No folders yet</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Center: Mode Toggle */}
        <div className="relative">
          <div className="flex items-center gap-0.5 rounded-lg p-0.5" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
            {['edit', 'split', 'preview'].map((mode) => (
              <button
                key={mode}
                onClick={() => setEditorMode(mode)}
                className="px-3 py-1.5 text-xs rounded-md transition-all font-medium flex items-center gap-1"
                style={{
                  backgroundColor: editorMode === mode ? 'var(--color-accent)' : 'transparent',
                  color: editorMode === mode ? 'white' : 'var(--color-text-tertiary)',
                }}
              >
                <span>{editorModeConfig[mode].icon}</span>
                <span className="hidden sm:inline">{editorModeConfig[mode].label}</span>
              </button>
            ))}
            
            {/* More modes dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowModeMenu(!showModeMenu)}
                className="px-2 py-1.5 text-xs rounded-md transition-all"
                style={{
                  backgroundColor: ['focus', 'zen', 'typewriter', 'reading'].includes(editorMode) ? 'var(--color-accent)' : 'transparent',
                  color: ['focus', 'zen', 'typewriter', 'reading'].includes(editorMode) ? 'white' : 'var(--color-text-tertiary)',
                }}
              >
                ⋯
              </button>
              
              {showModeMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowModeMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 w-36 rounded-lg shadow-xl z-50 py-1 fade-in"
                    style={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}>
                    {['focus', 'zen', 'typewriter', 'reading'].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => { setEditorMode(mode); setShowModeMenu(false); if (mode === 'zen') setSidebarOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors"
                        style={{
                          backgroundColor: editorMode === mode ? 'var(--color-accent-muted)' : 'transparent',
                          color: editorMode === mode ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                        }}
                        onMouseEnter={e => { if (editorMode !== mode) e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'; }}
                        onMouseLeave={e => { if (editorMode !== mode) e.currentTarget.style.backgroundColor = 'transparent'; }}
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
          <span className="hidden sm:inline" style={{ color: 'var(--color-text-tertiary)' }}>{saveStatus.text}</span>
        </div>
      </div>

      {/* Editor Content */}
      <div className={cn(
        "flex-1 flex overflow-auto",
        isReadingMode && "max-w-2xl mx-auto"
      )}>
        {showEditor && !showPreview && (
          <div className={cn("flex-1 h-full", isTypewriterMode && "typewriter-mode")}>
            <MarkdownEditor content={editorContent} onChange={setEditorContent} onSave={onSave} noteId={currentNote.id} noteTitle={currentNote.title} className={cn(isFocusMode && "text-lg leading-relaxed", isTypewriterMode && "text-lg")} />
          </div>
        )}

        {showPreview && !showEditor && (
          <div className="flex-1 overflow-auto">
            <MarkdownPreview content={editorContent} className={isReadingMode ? "prose-lg leading-loose" : ""} />
          </div>
        )}

        {showEditor && showPreview && (
          <>
            <div className="flex-1 h-full" style={{ borderRight: '1px solid var(--color-border)' }}>
              <MarkdownEditor content={editorContent} onChange={setEditorContent} onSave={onSave} noteId={currentNote.id} noteTitle={currentNote.title} />
            </div>
            <div className="flex-1 overflow-auto">
              <MarkdownPreview content={editorContent} />
            </div>
          </>
        )}
      </div>

      {/* Footer Stats */}
      {settings.show_word_count && (
        <div className="flex items-center justify-between px-4 py-2 text-xs" style={{ borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
          <div className="flex items-center gap-3">
            <span style={{ color: 'var(--color-text-tertiary)' }}>{wordCount} words</span>
            <span style={{ color: 'var(--color-text-tertiary)' }}>{charCount} chars</span>
            <span style={{ color: 'var(--color-text-tertiary)' }}>{readingTime}</span>
          </div>
          <div className="flex items-center gap-3">
            {currentNote.tags.length > 0 && (
              <div className="flex items-center gap-1">
                {currentNote.tags.slice(0, 3).map((t) => (
                  <span key={t} className="px-1.5 py-0.5 rounded text-[10px]" style={{ backgroundColor: 'var(--color-accent-muted)', color: 'var(--color-accent)' }}>
                    #{t}
                  </span>
                ))}
                {currentNote.tags.length > 3 && (
                  <span style={{ color: 'var(--color-text-tertiary)' }}>+{currentNote.tags.length - 3}</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
