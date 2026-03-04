'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

// Icons
const Icons = {
  plus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>,
  notes: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>,
  star: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  starFilled: <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  calendar: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  template: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>,
  graph: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="2" /><circle cx="6" cy="6" r="2" /><circle cx="18" cy="6" r="2" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="18" r="2" /><path d="M10.5 10.5 7.5 7.5M13.5 10.5l3-3M10.5 13.5l-3 3M13.5 13.5l3 3" /></svg>,
  bookmark: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>,
  trash: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>,
  folder: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>,
  folderOpen: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 19a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4l2 3h9a2 2 0 0 1 2 2v1M5 19h14a2 2 0 0 0 2-2l1-7H7.5" /></svg>,
  chevronRight: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>,
  chevronDown: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>,
  x: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  file: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>,
  moveFolder: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /><path d="M12 11v6M9 14h6" /></svg>,
};

export function Sidebar({
  notes = [],
  folders = [],
  onNoteSelect,
  onCreateNote,
  onCreateNoteInFolder,
  onCreateFolder,
  onDeleteNote,
  onDeleteFolder,
  onMoveNote,
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
  const deletedCount = notes.filter((n) => n.is_deleted).length;
  const rootFolders = folders.filter((f) => !f.parent_folder_id);
  const getNotesInFolder = (folderId) => allNotes.filter((n) => n.folder_id === folderId);
  const unfolderedNotes = allNotes.filter((n) => !n.folder_id);

  if (!sidebarOpen) return null;

  return (
    <aside className="w-60 border-r flex flex-col h-full" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
      {/* New Note Button */}
      <div className="p-4">
        <button
          onClick={onCreateNote}
          className="w-full px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-all flex items-center justify-center gap-2 hover:opacity-90"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          {Icons.plus}
          <span>New Note</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3">
        {/* Quick Access */}
        <div className="space-y-0.5">
          <NavItem icon={Icons.notes} label="All Notes" count={allNotes.length} active={currentFolderId === null} onClick={() => setCurrentFolderId(null)} />
          <NavItem icon={Icons.star} label="Favorites" count={favoriteNotes.length} onClick={() => router.push('/dashboard?filter=favorites')} />
        </div>

        <div className="my-4 mx-2 h-px" style={{ backgroundColor: 'var(--color-divider)' }} />

        {/* Tools */}
        <div className="mb-2">
          <SectionLabel>Tools</SectionLabel>
          <div className="space-y-0.5">
            {onJournalClick && <NavItem icon={Icons.calendar} label="Daily Journal" onClick={onJournalClick} />}
            {onTemplatesClick && <NavItem icon={Icons.template} label="Templates" onClick={onTemplatesClick} />}
            <NavItem icon={Icons.graph} label="Graph View" onClick={() => router.push('/dashboard/graph')} />
            <NavItem icon={Icons.bookmark} label="Saved Links" onClick={() => router.push('/dashboard/bookmarks')} />
          </div>
        </div>

        <div className="my-4 mx-2 h-px" style={{ backgroundColor: 'var(--color-divider)' }} />

        {/* Folders with nested notes */}
        <div className="mb-2">
          <div className="flex items-center justify-between px-3 mb-2">
            <SectionLabel className="mb-0 px-0">Folders</SectionLabel>
            <button onClick={onCreateFolder} className="p-1 transition-colors rounded" style={{ color: 'var(--color-text-tertiary)' }}>
              {Icons.plus}
            </button>
          </div>

          {rootFolders.length > 0 ? (
            <div className="space-y-0.5">
              {rootFolders.map((folder) => {
                const folderNotes = getNotesInFolder(folder.id);
                const isExpanded = expandedFolders.has(folder.id);
                const isActive = currentFolderId === folder.id;

                return (
                  <div key={folder.id}>
                    <div className="group">
                      <button
                        onClick={() => { setCurrentFolderId(folder.id); if (!isExpanded) toggleFolder(folder.id); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors"
                        style={{
                          backgroundColor: isActive ? 'var(--color-accent-muted)' : 'transparent',
                          color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                        }}
                        onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'; }}
                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <span onClick={(e) => { e.stopPropagation(); toggleFolder(folder.id); }} className="cursor-pointer" style={{ color: 'var(--color-text-tertiary)' }}>
                          {isExpanded ? Icons.chevronDown : Icons.chevronRight}
                        </span>
                        <span style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-text-tertiary)' }}>
                          {isExpanded ? Icons.folderOpen : Icons.folder}
                        </span>
                        <span className="flex-1 text-left truncate font-medium">{folder.name}</span>
                        <span className="text-xs tabular-nums" style={{ color: 'var(--color-text-tertiary)' }}>{folderNotes.length}</span>
                        {onDeleteFolder && (
                          <span onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder); }} className="opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity" style={{ color: 'var(--color-text-tertiary)' }}>
                            {Icons.x}
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Nested notes inside folder */}
                    {isExpanded && (
                      <div className="ml-4 pl-3 mt-0.5 space-y-0.5" style={{ borderLeft: '1px solid var(--color-divider)' }}>
                        {folderNotes.map((note) => (
                          <NoteItem
                            key={note.id}
                            note={note}
                            isActive={currentNote?.id === note.id}
                            isHovered={hoveredNote === note.id}
                            onClick={() => onNoteSelect(note)}
                            onDelete={onDeleteNote}
                            onMoveNote={onMoveNote}
                            folders={folders}
                            onMouseEnter={() => setHoveredNote(note.id)}
                            onMouseLeave={() => setHoveredNote(null)}
                          />
                        ))}
                        {/* Always show "+ New note" at the bottom of every expanded folder */}
                        {onCreateNoteInFolder && (
                          <button
                            onClick={() => {
                              console.log('[Sidebar] Creating note in folder:', folder.id, folder.name);
                              onCreateNoteInFolder(folder.id);
                            }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-lg transition-colors cursor-pointer"
                            style={{ color: 'var(--color-accent)', opacity: 0.7 }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'; e.currentTarget.style.opacity = '1'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.opacity = '0.7'; }}
                          >
                            {Icons.plus}
                            <span>New note</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="px-3 py-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>No folders yet</p>
          )}
        </div>

        {/* Loose Notes (not in any folder) */}
        {unfolderedNotes.length > 0 && (
          <>
            <div className="my-4 mx-2 h-px" style={{ backgroundColor: 'var(--color-divider)' }} />
            <div className="mb-2">
              <SectionLabel>Loose Notes</SectionLabel>
              <div className="space-y-0.5">
                {unfolderedNotes.map((note) => (
                  <NoteItem
                    key={note.id}
                    note={note}
                    isActive={currentNote?.id === note.id}
                    isHovered={hoveredNote === note.id}
                    onClick={() => onNoteSelect(note)}
                    onDelete={onDeleteNote}
                    onMoveNote={onMoveNote}
                    folders={folders}
                    onMouseEnter={() => setHoveredNote(note.id)}
                    onMouseLeave={() => setHoveredNote(null)}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        <div className="my-4 mx-2 h-px" style={{ backgroundColor: 'var(--color-divider)' }} />

        {/* Trash */}
        <NavItem icon={Icons.trash} label="Trash" count={deletedCount > 0 ? deletedCount : undefined} countColor="red" onClick={() => router.push('/trash')} />
      </nav>

      {/* Footer */}
      <div className="p-4" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          <span>{allNotes.length} notes</span>
          <span>{folders.length} folders</span>
        </div>
      </div>
    </aside>
  );
}

// Section Label
function SectionLabel({ children, className }) {
  return (
    <p className={cn('px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider', className)} style={{ color: 'var(--color-text-muted)' }}>
      {children}
    </p>
  );
}

// Nav Item
function NavItem({ icon, label, count, countColor, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors"
      style={{
        backgroundColor: active ? 'var(--color-accent-muted)' : 'transparent',
        color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'; e.currentTarget.style.color = 'var(--color-text-primary)'; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-text-secondary)'; } }}
    >
      <span style={{ color: active ? 'var(--color-accent)' : 'var(--color-text-tertiary)' }}>{icon}</span>
      <span className="flex-1 text-left font-medium">{label}</span>
      {count !== undefined && (
        <span className="px-1.5 py-0.5 text-xs rounded-md tabular-nums" style={{
          backgroundColor: countColor === 'red' ? 'rgba(239,68,68,0.1)' : 'var(--color-bg-primary)',
          color: countColor === 'red' ? 'var(--color-error)' : 'var(--color-text-tertiary)',
        }}>
          {count}
        </span>
      )}
    </button>
  );
}

// Note Item (nested inside folders or loose)
function NoteItem({ note, isActive, isHovered, onClick, onDelete, onMoveNote, folders = [], onMouseEnter, onMouseLeave }) {
  const [contextMenu, setContextMenu] = useState(null); // { x, y } or null
  const timeAgo = getTimeAgo(new Date(note.updated_at));

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Clamp position so the menu doesn't go off-screen
    const menuW = 200, menuH = 300;
    const x = Math.min(e.clientX, window.innerWidth - menuW - 8);
    const y = Math.min(e.clientY, window.innerHeight - menuH - 8);
    setContextMenu({ x, y });
  };

  const closeMenu = () => {
    setContextMenu(null);
  };

  return (
    <div className="group relative" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <button
        onClick={onClick}
        onContextMenu={handleContextMenu}
        className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg transition-colors"
        style={{
          backgroundColor: isActive ? 'var(--color-accent-muted)' : 'transparent',
          color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
        }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'; }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
      >
        <span style={{ color: 'var(--color-text-muted)' }}>{Icons.file}</span>
        {note.is_favorite && <span className="text-amber-500">{Icons.starFilled}</span>}
        <span className={cn('flex-1 text-left truncate text-[13px]', isActive && 'font-medium')}>
          {note.title || 'Untitled'}
        </span>
        {onDelete && (
          <span onClick={(e) => { e.stopPropagation(); onDelete(note); }} className="opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity" style={{ color: 'var(--color-text-tertiary)' }}>
            {Icons.x}
          </span>
        )}
      </button>

      {/* Right-click Context Menu — all inline, no side submenu */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={closeMenu} onContextMenu={(e) => { e.preventDefault(); closeMenu(); }} />
          <div
            className="fixed z-[101] w-52 rounded-lg shadow-2xl py-1 fade-in max-h-80 overflow-y-auto"
            style={{
              top: contextMenu.y,
              left: contextMenu.x,
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
            }}
          >
            {/* Open */}
            <button
              onClick={() => { onClick(); closeMenu(); }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors"
              style={{ color: 'var(--color-text-primary)' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {Icons.file}
              <span>Open</span>
            </button>

            <div className="my-1 h-px" style={{ backgroundColor: 'var(--color-divider)' }} />

            {/* Move to Folder — inline list */}
            {onMoveNote && (folders.length > 0 || note.folder_id) && (
              <>
                <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                  Move to
                </p>
                {/* Remove from folder */}
                {note.folder_id && (
                  <button
                    onClick={() => { onMoveNote(note.id, null); closeMenu(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span style={{ color: 'var(--color-text-tertiary)' }}>{Icons.file}</span>
                    <span>Loose Notes</span>
                  </button>
                )}
                {/* Folder options */}
                {folders.filter(f => f.id !== note.folder_id).map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => { onMoveNote(note.id, folder.id); closeMenu(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span style={{ color: 'var(--color-text-tertiary)' }}>{Icons.folder}</span>
                    <span className="truncate">{folder.name}</span>
                  </button>
                ))}

                <div className="my-1 h-px" style={{ backgroundColor: 'var(--color-divider)' }} />
              </>
            )}

            {/* Delete */}
            {onDelete && (
              <button
                onClick={() => { onDelete(note); closeMenu(); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors"
                style={{ color: 'var(--color-error)' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {Icons.trash}
                <span>Delete</span>
              </button>
            )}
          </div>
        </>
      )}

      {/* Preview Tooltip */}
      {isHovered && !contextMenu && note.content && (
        <div className="absolute left-full top-0 ml-2 z-50 w-56 p-3 rounded-lg shadow-xl pointer-events-none animate-fadeIn"
          style={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}>
          <p className="text-sm font-medium mb-1 truncate" style={{ color: 'var(--color-text-primary)' }}>{note.title || 'Untitled'}</p>
          <p className="text-xs line-clamp-3" style={{ color: 'var(--color-text-tertiary)' }}>{note.content.slice(0, 150)}...</p>
          <p className="text-[10px] mt-1.5" style={{ color: 'var(--color-text-muted)' }}>{timeAgo}</p>
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
