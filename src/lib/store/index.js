import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { themes, defaultTheme, getThemeById } from '@/lib/constants/themes';
import { defaultUserSettings } from '@/lib/types/database';

export const useAppStore = create(
  persist(
    (set) => ({
      // Theme
      theme: defaultTheme,
      setTheme: (themeId) => set({ theme: getThemeById(themeId) }),

      // CRT Effects
      crtEnabled: false,
      setCrtEnabled: (enabled) => set({ crtEnabled: enabled }),
      crtIntensity: 30,
      setCrtIntensity: (intensity) => set({ crtIntensity: Math.max(0, Math.min(100, intensity)) }),

      // User Settings
      settings: defaultUserSettings,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      // Sidebar
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      // Notes
      notes: [],
      setNotes: (notes) => set({ notes }),
      addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
      updateNote: (note) =>
        set((state) => ({
          notes: state.notes.map((n) => (n.id === note.id ? note : n)),
          currentNote: state.currentNote?.id === note.id ? note : state.currentNote,
        })),
      deleteNote: (noteId) =>
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== noteId),
          currentNote: state.currentNote?.id === noteId ? null : state.currentNote,
        })),

      // Current Note
      currentNote: null,
      setCurrentNote: (note) =>
        set({
          currentNote: note,
          editorContent: note?.content || '',
          hasUnsavedChanges: false,
        }),

      // Folders
      folders: [],
      setFolders: (folders) => set({ folders }),
      addFolder: (folder) => set((state) => ({ folders: [...state.folders, folder] })),
      updateFolder: (folder) =>
        set((state) => ({
          folders: state.folders.map((f) => (f.id === folder.id ? folder : f)),
        })),
      deleteFolder: (folderId) =>
        set((state) => ({
          folders: state.folders.filter((f) => f.id !== folderId),
          currentFolderId: state.currentFolderId === folderId ? null : state.currentFolderId,
        })),

      // Current Folder
      currentFolderId: null,
      setCurrentFolderId: (folderId) => set({ currentFolderId: folderId, sidebarFilter: 'folder' }),

      // Sidebar Filter (all, favorites, recent, folder)
      sidebarFilter: 'all',
      setSidebarFilter: (filter) => set({ sidebarFilter: filter, currentFolderId: filter === 'folder' ? undefined : null }),

      // Editor State
      editorContent: '',
      setEditorContent: (content) => set({ editorContent: content, hasUnsavedChanges: true }),
      isSaving: false,
      setIsSaving: (saving) => set({ isSaving: saving }),
      lastSaved: null,
      setLastSaved: (date) => set({ lastSaved: date }),
      hasUnsavedChanges: false,
      setHasUnsavedChanges: (hasChanges) => set({ hasUnsavedChanges: hasChanges }),

      // Editor Mode
      editorMode: 'edit',
      setEditorMode: (mode) => set({ editorMode: mode }),

      // Search
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      searchResults: [],
      setSearchResults: (results) => set({ searchResults: results }),

      // Command Palette
      commandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

      // Stats Modal
      statsModalOpen: false,
      setStatsModalOpen: (open) => set({ statsModalOpen: open }),
    }),
    {
      name: 'second-brain-storage',
      partialize: (state) => ({
        theme: state.theme,
        settings: state.settings,
        sidebarOpen: state.sidebarOpen,
        editorMode: state.editorMode,
        crtEnabled: state.crtEnabled,
        crtIntensity: state.crtIntensity,
      }),
    }
  )
);
