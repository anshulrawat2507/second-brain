'use client';

import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { Header, Sidebar } from '@/components/layout';
import { NoteEditor } from '@/components/editor';
import { SearchModal } from '@/components/search';
import { QuickNotesPanel } from '@/components/quick-notes';
import { TemplateSelector } from '@/components/templates';
import { Modal, Input, Button, LoadingScreen } from '@/components/ui';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { KeyboardShortcuts } from '@/components/ui/KeyboardShortcuts';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import { StatsDashboard } from '@/components/dashboard/StatsDashboard';
import { NoteCardsGrid } from '@/components/dashboard/NoteCardsGrid';
import { DailyJournal } from '@/components/journal/DailyJournal';
import { VersionHistoryPanel } from '@/components/editor/VersionHistoryPanel';
import { PWAInstallPrompt, PWAUpdatePrompt, OfflineIndicator } from '@/components/pwa';
import { usePWA } from '@/hooks/usePWA';
import { debounce, extractTitle, generateId, countWords, countCharacters, extractTags } from '@/lib/utils';
import toast from 'react-hot-toast';

// Dynamic import for Three.js background to avoid SSR issues
const DashboardBackground = dynamic(
  () => import('@/components/three/DashboardBackground').then(mod => ({ default: mod.DashboardBackground })),
  { ssr: false }
);

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showQuickNotes, setShowQuickNotes] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  
  // Phase 4 modals
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showThemeSwitcher, setShowThemeSwitcher] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  const {
    notes,
    setNotes,
    addNote,
    updateNote,
    deleteNote: removeNote,
    folders,
    setFolders,
    addFolder,
    deleteFolder: removeFolder,
    currentNote,
    setCurrentNote,
    editorContent,
    setEditorContent,
    setIsSaving,
    setLastSaved,
    setHasUnsavedChanges,
    settings,
    sidebarOpen,
  } = useAppStore();



  // PWA hook for offline caching
  const { cacheNotes } = usePWA();

  // Fetch notes and folders on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient();
        
        // Check auth
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          router.push('/login');
          return;
        }
        setUser(authUser);

        // Fetch notes
        const notesRes = await fetch('/api/notes');
        const notesData = await notesRes.json();
        if (notesData.success) {
          setNotes(notesData.data || []);
          // Cache notes for offline access
          cacheNotes(notesData.data || []);
        }

        // Fetch folders
        const foldersRes = await fetch('/api/folders');
        const foldersData = await foldersRes.json();
        if (foldersData.success) {
          setFolders(foldersData.data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load your notes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router, setNotes, setFolders]);

  // Auto-save functionality
  const saveNote = useCallback(async () => {
    if (!currentNote) return;

    setIsSaving(true);

    try {
      const response = await fetch(`/api/notes/${currentNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editorContent,
          title: extractTitle(editorContent) || currentNote.title,
          tags: extractTags(editorContent),
        }),
      });

      const data = await response.json();

      if (data.success) {
        updateNote(data.data);
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      } else {
        toast.error('Failed to save note');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  }, [currentNote, editorContent, updateNote, setIsSaving, setLastSaved, setHasUnsavedChanges]);

  // Debounced auto-save
  const debouncedSave = useCallback(
    debounce(() => {
      saveNote();
    }, settings.auto_save_interval),
    [saveNote, settings.auto_save_interval]
  );

  // Trigger auto-save when content changes
  useEffect(() => {
    if (currentNote && editorContent !== currentNote.content) {
      debouncedSave();
    }
  }, [editorContent, currentNote, debouncedSave]);

  // Create new note
  const handleCreateNote = async () => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Untitled',
          content: '# Untitled\n\nStart writing...',
        }),
      });

      const data = await response.json();

      if (data.success) {
        addNote(data.data);
        setCurrentNote(data.data);
        setEditorContent(data.data.content);
        toast.success('New note created');
      } else {
        toast.error('Failed to create note');
      }
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
    }
  };

  // Create new folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Folder name is required');
      return;
    }

    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName }),
      });

      const data = await response.json();

      if (data.success) {
        addFolder(data.data);
        setNewFolderName('');
        setShowNewFolderModal(false);
        toast.success('Folder created');
      } else {
        toast.error('Failed to create folder');
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create folder');
    }
  };

  // Select note
  const handleNoteSelect = (note) => {
    // Save current note before switching
    if (currentNote && editorContent !== currentNote.content) {
      saveNote();
    }
    
    setCurrentNote(note);
    setEditorContent(note.content);
  };

  // Delete note
  const handleDeleteNote = async (note) => {
    if (!confirm(`Delete "${note.title || 'Untitled'}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        removeNote(note.id);
        if (currentNote?.id === note.id) {
          setCurrentNote(null);
          setEditorContent('');
        }
        toast.success('Note deleted');
      } else {
        toast.error('Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  // Delete folder
  const handleDeleteFolder = async (folder) => {
    const notesInFolder = notes.filter(n => n.folder_id === folder.id);
    const message = notesInFolder.length > 0
      ? `Delete "${folder.name}"? This folder contains ${notesInFolder.length} note(s). Notes will be moved to root.`
      : `Delete "${folder.name}"?`;
    
    if (!confirm(message)) {
      return;
    }

    try {
      const response = await fetch(`/api/folders/${folder.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        removeFolder(folder.id);
        toast.success('Folder deleted');
        // Refresh notes to update folder_id references
        const notesRes = await fetch('/api/notes');
        const notesData = await notesRes.json();
        if (notesData.success) {
          setNotes(notesData.data || []);
        }
      } else {
        toast.error('Failed to delete folder');
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Failed to delete folder');
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + N: New note
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleCreateNote();
      }

      // Ctrl/Cmd + S: Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveNote();
      }

      // Ctrl/Cmd + K: Search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(true);
      }

      // Ctrl/Cmd + P: Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        setShowCommandPalette(true);
      }

      // Ctrl/Cmd + Q: Quick note
      if ((e.ctrlKey || e.metaKey) && e.key === 'q') {
        e.preventDefault();
        setShowQuickNotes(true);
      }

      // Ctrl/Cmd + T: Templates
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        setShowTemplateSelector(true);
      }

      // Ctrl/Cmd + J: Daily Journal
      if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault();
        setShowJournal(true);
      }

      // Ctrl/Cmd + G: Graph
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault();
        router.push('/dashboard/graph');
      }

      // Ctrl/Cmd + H: Version History
      if ((e.ctrlKey || e.metaKey) && e.key === 'h' && currentNote) {
        e.preventDefault();
        setShowVersionHistory(true);
      }

      // Ctrl/Cmd + L: Saved Links (navigate to bookmarks page)
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        router.push('/dashboard/bookmarks');
      }

      // Ctrl/Cmd + /: Toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        useAppStore.getState().toggleSidebar();
      }

      // ?: Show keyboard shortcuts
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        const activeElement = document.activeElement;
        if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setShowKeyboardShortcuts(true);
        }
      }

      // Ctrl/Cmd + 1-5: Editor modes
      if ((e.ctrlKey || e.metaKey) && e.key === '1') {
        e.preventDefault();
        useAppStore.getState().setEditorMode('edit');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '2') {
        e.preventDefault();
        useAppStore.getState().setEditorMode('preview');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '3') {
        e.preventDefault();
        useAppStore.getState().setEditorMode('split');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '4') {
        e.preventDefault();
        useAppStore.getState().setEditorMode('focus');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '5') {
        e.preventDefault();
        useAppStore.getState().setEditorMode('zen');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCreateNote, saveNote, currentNote, router]);

  if (isLoading) {
    return <LoadingScreen message="Loading your brain..." />;
  }

  const { crtEnabled, crtIntensity } = useAppStore.getState();

  return (
    <div className="h-screen flex flex-col bg-zinc-950 relative overflow-hidden">
      {/* Three.js animated background */}
      <DashboardBackground />

      {/* CRT Scanlines Overlay */}
      {crtEnabled && (
        <div 
          className="crt-scanlines pointer-events-none fixed inset-0 z-50"
          style={{ opacity: crtIntensity / 100 }}
        />
      )}
      
      {/* Main content */}
      <div className="relative z-10 flex flex-col h-full">
        <Header 
          onSearchClick={() => setShowSearchModal(true)} 
          onThemeClick={() => setShowThemeSwitcher(true)}
          user={user}
        />
        
        <div className="flex-1 flex overflow-hidden">
          <Sidebar
            notes={notes}
            folders={folders}
            onNoteSelect={handleNoteSelect}
            onCreateNote={handleCreateNote}
            onCreateFolder={() => setShowNewFolderModal(true)}
            onDeleteNote={handleDeleteNote}
            onDeleteFolder={handleDeleteFolder}
            onTemplatesClick={() => setShowTemplateSelector(true)}
            onJournalClick={() => setShowJournal(true)}
          />
          
          {/* Show NoteCardsGrid when no note selected, otherwise show editor */}
          {currentNote ? (
            <NoteEditor onSave={saveNote} />
          ) : (
            <NoteCardsGrid
              notes={notes.filter(n => !n.is_deleted)}
              onNoteSelect={handleNoteSelect}
              onCreateNote={handleCreateNote}
            />
          )}
        </div>
      </div>

      {/* New Folder Modal */}
      <Modal
        isOpen={showNewFolderModal}
        onClose={() => {
          setShowNewFolderModal(false);
          setNewFolderName('');
        }}
        title="Create New Folder"
        size="sm"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateFolder();
          }}
          className="space-y-4"
        >
          <Input
            label="Folder Name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="My Folder"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowNewFolderModal(false);
                setNewFolderName('');
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Create Folder</Button>
          </div>
        </form>
      </Modal>

      {/* Search Modal */}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelectNote={handleNoteSelect}
      />

      {/* Quick Notes Panel */}
      <QuickNotesPanel
        isOpen={showQuickNotes}
        onClose={() => setShowQuickNotes(false)}
        onSave={async (content) => {
          try {
            const response = await fetch('/api/notes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: extractTitle(content) || 'Quick Note',
                content,
                is_quick_note: true,
              }),
            });
            const data = await response.json();
            if (data.success) {
              addNote(data.data);
              toast.success('Quick note saved!');
            }
          } catch (error) {
            toast.error('Failed to save quick note');
          }
        }}
      />

      {/* Template Selector */}
      <TemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelect={async (content, title) => {
          try {
            const response = await fetch('/api/notes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title, content }),
            });
            const data = await response.json();
            if (data.success) {
              addNote(data.data);
              setCurrentNote(data.data);
              setEditorContent(data.data.content);
              toast.success(`Created from template: ${title}`);
            }
          } catch (error) {
            toast.error('Failed to create from template');
          }
        }}
      />

      {/* Phase 4 Modals */}
      
      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onCreateNote={handleCreateNote}
        onCreateFolder={() => setShowNewFolderModal(true)}
        onOpenSearch={() => setShowSearchModal(true)}
        onOpenTemplates={() => setShowTemplateSelector(true)}
        onOpenJournal={() => setShowJournal(true)}
        onOpenStats={() => setShowStats(true)}
        onOpenThemes={() => setShowThemeSwitcher(true)}
        onOpenSavedLinks={() => router.push('/dashboard/bookmarks')}
      />

      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts
        isOpen={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />

      {/* Theme Switcher */}
      <ThemeSwitcher
        isOpen={showThemeSwitcher}
        onClose={() => setShowThemeSwitcher(false)}
      />

      {/* Statistics Dashboard */}
      <StatsDashboard
        isOpen={showStats}
        onClose={() => setShowStats(false)}
      />

      {/* Daily Journal */}
      <DailyJournal
        isOpen={showJournal}
        onClose={() => setShowJournal(false)}
        onOpenNote={handleNoteSelect}
      />

      {/* Version History */}
      {currentNote && (
        <VersionHistoryPanel
          noteId={currentNote.id}
          isOpen={showVersionHistory}
          onClose={() => setShowVersionHistory(false)}
          onRestore={(content, title) => {
            setEditorContent(content);
            toast.success('Version restored! Save to apply changes.');
          }}
        />
      )}

      {/* PWA Prompts */}
      <OfflineIndicator />
      <PWAInstallPrompt />
      <PWAUpdatePrompt />
    </div>
  );
}
