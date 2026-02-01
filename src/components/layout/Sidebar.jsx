'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

// Icons
const Icons = {
  plus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>,
  notes: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>,
  star: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  starFilled: <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  zap: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  calendar: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  template: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>,
  graph: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="2" /><circle cx="6" cy="6" r="2" /><circle cx="18" cy="6" r="2" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="18" r="2" /><path d="M10.5 10.5 7.5 7.5M13.5 10.5l3-3M10.5 13.5l-3 3M13.5 13.5l3 3" /></svg>,
  bookmark: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>,
  trash: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>,
  folder: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>,
  chevronRight: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>,
  chevronDown: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>,
  x: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
};

export function Sidebar({
  notes = [],
  folders = [],
  onNoteSelect,
  onCreateNote,
  onCreateFolder,
  onDeleteNote,
  onDeleteFolder,
  onTemplatesClick,
  onJournalClick,
}) {
  const router = useRouter();
  const { sidebarOpen, currentNote, currentFolderId, setCurrentFolderId } = useAppStore();
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [hoveredNote, setHoveredNote] = useState(null);

  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  // Filter notes
  const allNotes = notes.filter((n) => !n.is_deleted);
  const favoriteNotes = allNotes.filter((n) => n.is_favorite);
  const recentNotes = [...allNotes]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 6);
  const deletedCount = notes.filter((n) => n.is_deleted).length;
  const rootFolders = folders.filter((f) => !f.parent_folder_id);
  const getNotesInFolder = (folderId) => notes.filter((n) => n.folder_id === folderId && !n.is_deleted);

  if (!sidebarOpen) return null;

  return (
    <aside className="w-60 border-r border-zinc-700/50 bg-zinc-900 flex flex-col h-full">
      {/* New Note Button */}
      <div className="p-4">
        <button
          onClick={onCreateNote}
          className="w-full px-4 py-2.5 text-sm font-medium bg-purple-600 text-white rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
        >
          {Icons.plus}
          <span>New Note</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3">
        {/* Main Navigation */}
        <div className="space-y-1">
          <NavItem
            icon={Icons.notes}
            label="All Notes"
            count={allNotes.length}
            active={currentFolderId === null}
            onClick={() => setCurrentFolderId(null)}
          />
          <NavItem
            icon={Icons.star}
            label="Favorites"
            count={favoriteNotes.length}
            onClick={() => router.push('/dashboard?filter=favorites')}
          />
        </div>

        {/* Section Divider */}
        <div className="my-4 mx-2 h-px bg-zinc-700/50" />

        {/* Tools Section */}
        <div className="mb-2">
          <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Tools
          </p>
          <div className="space-y-1">
            {onJournalClick && (
              <NavItem icon={Icons.calendar} label="Daily Journal" onClick={onJournalClick} />
            )}
            {onTemplatesClick && (
              <NavItem icon={Icons.template} label="Templates" onClick={onTemplatesClick} />
            )}
            <NavItem icon={Icons.graph} label="Graph View" onClick={() => router.push('/dashboard/graph')} />
            <NavItem icon={Icons.bookmark} label="Saved Links" onClick={() => router.push('/dashboard/bookmarks')} />
          </div>
        </div>

        {/* Section Divider */}
        <div className="my-4 mx-2 h-px bg-zinc-700/50" />

        {/* Folders Section */}
        <div className="mb-2">
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Folders
            </p>
            <button
              onClick={onCreateFolder}
              className="p-1 text-zinc-500 hover:text-purple-400 transition-colors rounded"
            >
              {Icons.plus}
            </button>
          </div>
          
          {rootFolders.length > 0 ? (
            <div className="space-y-0.5">
              {rootFolders.map((folder) => (
                <FolderItem
                  key={folder.id}
                  folder={folder}
                  noteCount={getNotesInFolder(folder.id).length}
                  isExpanded={expandedFolders.has(folder.id)}
                  isActive={currentFolderId === folder.id}
                  onToggle={() => toggleFolder(folder.id)}
                  onClick={() => setCurrentFolderId(folder.id)}
                  onDelete={onDeleteFolder}
                />
              ))}
            </div>
          ) : (
            <p className="px-3 py-2 text-xs text-zinc-500">No folders</p>
          )}
        </div>

        {/* Section Divider */}
        <div className="my-4 mx-2 h-px bg-zinc-700/50" />

        {/* Recent Notes Section */}
        <div className="mb-2">
          <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Recent
          </p>
          <div className="space-y-0.5">
            {recentNotes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                isActive={currentNote?.id === note.id}
                isHovered={hoveredNote === note.id}
                onClick={() => onNoteSelect(note)}
                onDelete={onDeleteNote}
                onMouseEnter={() => setHoveredNote(note.id)}
                onMouseLeave={() => setHoveredNote(null)}
              />
            ))}
          </div>
        </div>

        {/* Section Divider */}
        <div className="my-4 mx-2 h-px bg-zinc-700/50" />

        {/* Trash */}
        <NavItem
          icon={Icons.trash}
          label="Trash"
          count={deletedCount > 0 ? deletedCount : undefined}
          countColor="red"
          onClick={() => router.push('/trash')}
        />
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-700/50">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>{allNotes.length} notes</span>
          <span>{folders.length} folders</span>
        </div>
      </div>
    </aside>
  );
}

// Nav Item Component
function NavItem({ icon, label, count, countColor, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors',
        active
          ? 'bg-purple-500/15 text-purple-400'
          : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
      )}
    >
      <span className={active ? 'text-purple-400' : 'text-zinc-500'}>
        {icon}
      </span>
      <span className="flex-1 text-left font-medium">{label}</span>
      {count !== undefined && (
        <span className={cn(
          'px-1.5 py-0.5 text-xs rounded-md tabular-nums',
          countColor === 'red' 
            ? 'bg-red-500/10 text-red-500' 
            : 'bg-zinc-950 text-zinc-500'
        )}>
          {count}
        </span>
      )}
    </button>
  );
}

// Folder Item Component
function FolderItem({ folder, noteCount, isExpanded, isActive, onToggle, onClick, onDelete }) {
  return (
    <div className="group">
      <button
        onClick={onClick}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors',
          isActive
            ? 'bg-purple-500/15 text-purple-400'
            : 'text-zinc-400 hover:bg-zinc-800'
        )}
      >
        <span 
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className="cursor-pointer hover:text-purple-400"
        >
          {isExpanded ? Icons.chevronDown : Icons.chevronRight}
        </span>
        <span className="text-zinc-500">{Icons.folder}</span>
        <span className="flex-1 text-left truncate">{folder.name}</span>
        <span className="text-xs text-zinc-500 tabular-nums">{noteCount}</span>
        {onDelete && (
          <span
            onClick={(e) => { e.stopPropagation(); onDelete(folder); }}
            className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-500 cursor-pointer"
          >
            {Icons.x}
          </span>
        )}
      </button>
    </div>
  );
}

// Note Item Component
function NoteItem({ note, isActive, isHovered, onClick, onDelete, onMouseEnter, onMouseLeave }) {
  const timeAgo = getTimeAgo(new Date(note.updated_at));
  
  return (
    <div className="group relative" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <button
        onClick={onClick}
        className={cn(
          'w-full flex flex-col items-start px-3 py-2 text-sm rounded-lg transition-colors',
          isActive
            ? 'bg-purple-500/15'
            : 'hover:bg-zinc-800'
        )}
      >
        <div className="flex items-center gap-2 w-full">
          {note.is_favorite && (
            <span className="text-amber-500">{Icons.starFilled}</span>
          )}
          <span className={cn(
            'flex-1 text-left truncate',
            isActive ? 'text-purple-400 font-medium' : 'text-zinc-400'
          )}>
            {note.title || 'Untitled'}
          </span>
          {onDelete && (
            <span
              onClick={(e) => { e.stopPropagation(); onDelete(note); }}
              className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-500 cursor-pointer"
            >
              {Icons.x}
            </span>
          )}
        </div>
        <span className="text-xs text-zinc-500 mt-0.5">{timeAgo}</span>
      </button>
      
      {/* Preview Tooltip */}
      {isHovered && note.content && (
        <div className="absolute left-full top-0 ml-2 z-50 w-56 p-3 bg-zinc-800 border border-zinc-700/50 rounded-lg shadow-xl pointer-events-none animate-fadeIn">
          <p className="text-sm text-zinc-100 font-medium mb-1 truncate">
            {note.title || 'Untitled'}
          </p>
          <p className="text-xs text-zinc-500 line-clamp-3">
            {note.content.slice(0, 150)}...
          </p>
        </div>
      )}
    </div>
  );
}

// Time ago helper
function getTimeAgo(date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default Sidebar;
