'use client';

import { useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function StatsDashboard({ isOpen, onClose }) {
  const { notes, folders } = useAppStore();

  const stats = useMemo(() => {
    const allNotes = notes.filter(n => !n.is_deleted);
    const today = new Date();
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const totalWords = allNotes.reduce((acc, note) => {
      return acc + (note.content?.split(/\s+/).filter(Boolean).length || 0);
    }, 0);
    const totalChars = allNotes.reduce((acc, note) => acc + (note.content?.length || 0), 0);
    const allTags = allNotes.flatMap(n => n.tags || []);
    const tagCounts = allTags.reduce((acc, tag) => { acc[tag] = (acc[tag] || 0) + 1; return acc; }, {});
    const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const notesThisWeek = allNotes.filter(n => new Date(n.created_at) >= thisWeek).length;
    const notesThisMonth = allNotes.filter(n => new Date(n.created_at) >= thisMonth).length;
    const favorites = allNotes.filter(n => n.is_favorite).length;
    const quickNotes = allNotes.filter(n => n.is_quick_note).length;
    const avgLength = allNotes.length > 0 ? Math.round(totalWords / allNotes.length) : 0;
    const totalReadingMins = Math.round(totalWords / 200);
    const dayActivity = [0, 0, 0, 0, 0, 0, 0];
    allNotes.forEach(note => { dayActivity[new Date(note.updated_at).getDay()]++; });
    const maxDayActivity = Math.max(...dayActivity, 1);

    return { totalNotes: allNotes.length, totalFolders: folders.length, totalWords, totalChars, favorites, quickNotes, notesThisWeek, notesThisMonth, avgLength, totalReadingMins, topTags, dayActivity, maxDayActivity, uniqueTags: Object.keys(tagCounts).length };
  }, [notes, folders]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-2xl pointer-events-auto max-h-[85vh] overflow-hidden flex flex-col"
          style={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}
          onClick={(e) => e.stopPropagation()}>
          
          <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Statistics Dashboard</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors" style={{ color: 'var(--color-text-tertiary)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="p-4 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <StatCard icon="📝" label="Total Notes" value={stats.totalNotes} />
              <StatCard icon="📁" label="Folders" value={stats.totalFolders} />
              <StatCard icon="📖" label="Total Words" value={stats.totalWords.toLocaleString()} />
              <StatCard icon="⏱️" label="Reading Time" value={`${stats.totalReadingMins}m`} />
            </div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <StatCard icon="⭐" label="Favorites" value={stats.favorites} small />
              <StatCard icon="⚡" label="Quick Notes" value={stats.quickNotes} small />
              <StatCard icon="🏷️" label="Unique Tags" value={stats.uniqueTags} small />
            </div>

            <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
              <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>Activity by Day</h3>
              <div className="flex items-end justify-between gap-2 h-24">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-t transition-all duration-300"
                      style={{ backgroundColor: 'var(--color-accent)', height: `${(stats.dayActivity[i] / stats.maxDayActivity) * 100}%`, minHeight: stats.dayActivity[i] > 0 ? '4px' : '0' }} />
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{day}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>This Week</h3>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>{stats.notesThisWeek}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>notes created</p>
              </div>
              <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>This Month</h3>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>{stats.notesThisMonth}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>notes created</p>
              </div>
            </div>

            <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
              <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>Most Used Tags</h3>
              {stats.topTags.length > 0 ? (
                <div className="space-y-2">
                  {stats.topTags.map(([tag, count]) => (
                    <div key={tag} className="flex items-center gap-3">
                      <span className="text-sm" style={{ color: 'var(--color-accent)' }}>#{tag}</span>
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
                        <div className="h-full rounded-full transition-all duration-300" style={{ backgroundColor: 'var(--color-accent)', width: `${(count / stats.topTags[0][1]) * 100}%` }} />
                      </div>
                      <span className="text-xs font-mono w-8 text-right" style={{ color: 'var(--color-text-muted)' }}>{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm italic" style={{ color: 'var(--color-text-muted)' }}>No tags used yet</p>
              )}
            </div>
          </div>

          <div className="p-4" style={{ borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
            <div className="flex items-center justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
              <span>Avg. note length: {stats.avgLength} words</span>
              <span>Total characters: {stats.totalChars.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ icon, label, value, small = false }) {
  return (
    <div className={cn('rounded-xl transition-all hover:scale-105', small ? 'p-3' : 'p-4')}
      style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <div className="flex items-center gap-2 mb-1">
        <span className={small ? 'text-base' : 'text-lg'}>{icon}</span>
        <span className={small ? 'text-xs' : 'text-sm'} style={{ color: 'var(--color-text-tertiary)' }}>{label}</span>
      </div>
      <p className={cn('font-bold', small ? 'text-xl' : 'text-2xl')} style={{ color: 'var(--color-accent)' }}>{value}</p>
    </div>
  );
}
