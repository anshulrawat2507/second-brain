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
    
    // Word and character counts
    const totalWords = allNotes.reduce((acc, note) => {
      const words = note.content?.split(/\s+/).filter(Boolean).length || 0;
      return acc + words;
    }, 0);
    
    const totalChars = allNotes.reduce((acc, note) => {
      return acc + (note.content?.length || 0);
    }, 0);

    // Tags analysis
    const allTags = allNotes.flatMap(n => n.tags || []);
    const tagCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Notes by date
    const notesThisWeek = allNotes.filter(n => new Date(n.created_at) >= thisWeek).length;
    const notesThisMonth = allNotes.filter(n => new Date(n.created_at) >= thisMonth).length;

    // Favorites and quick notes
    const favorites = allNotes.filter(n => n.is_favorite).length;
    const quickNotes = allNotes.filter(n => n.is_quick_note).length;

    // Average note length
    const avgLength = allNotes.length > 0 ? Math.round(totalWords / allNotes.length) : 0;

    // Reading time (assuming 200 words per minute)
    const totalReadingMins = Math.round(totalWords / 200);

    // Activity by day of week
    const dayActivity = [0, 0, 0, 0, 0, 0, 0]; // Sun to Sat
    allNotes.forEach(note => {
      const day = new Date(note.updated_at).getDay();
      dayActivity[day]++;
    });
    const maxDayActivity = Math.max(...dayActivity, 1);

    return {
      totalNotes: allNotes.length,
      totalFolders: folders.length,
      totalWords,
      totalChars,
      favorites,
      quickNotes,
      notesThisWeek,
      notesThisMonth,
      avgLength,
      totalReadingMins,
      topTags,
      dayActivity,
      maxDayActivity,
      uniqueTags: Object.keys(tagCounts).length,
    };
  }, [notes, folders]);

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
              <span className="text-2xl">📊</span>
              <h2 className="text-lg font-bold text-zinc-100">
                Statistics Dashboard
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
          <div className="p-4 overflow-y-auto">
            {/* Top Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <StatCard 
                icon="📝" 
                label="Total Notes" 
                value={stats.totalNotes} 
                color="purple"
              />
              <StatCard 
                icon="📁" 
                label="Folders" 
                value={stats.totalFolders} 
                color="blue"
              />
              <StatCard 
                icon="📖" 
                label="Total Words" 
                value={stats.totalWords.toLocaleString()} 
                color="green"
              />
              <StatCard 
                icon="⏱️" 
                label="Reading Time" 
                value={`${stats.totalReadingMins}m`} 
                color="violet"
              />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <StatCard 
                icon="⭐" 
                label="Favorites" 
                value={stats.favorites} 
                color="yellow"
                small
              />
              <StatCard 
                icon="⚡" 
                label="Quick Notes" 
                value={stats.quickNotes} 
                color="orange"
                small
              />
              <StatCard 
                icon="🏷️" 
                label="Unique Tags" 
                value={stats.uniqueTags} 
                color="pink"
                small
              />
            </div>

            {/* Activity Chart */}
            <div className="bg-zinc-800/50 rounded-xl p-4 mb-6">
              <h3 className="text-sm font-medium text-zinc-200 mb-3">
                Activity by Day
              </h3>
              <div className="flex items-end justify-between gap-2 h-24">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1">
                    <div 
                      className="w-full bg-gradient-to-t from-purple-600 to-violet-600 rounded-t transition-all duration-300"
                      style={{ 
                        height: `${(stats.dayActivity[i] / stats.maxDayActivity) * 100}%`,
                        minHeight: stats.dayActivity[i] > 0 ? '4px' : '0'
                      }}
                    />
                    <span className="text-xs text-zinc-500">{day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-zinc-800/50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-zinc-200 mb-2">
                  This Week
                </h3>
                <p className="text-2xl font-bold text-purple-400">
                  {stats.notesThisWeek}
                </p>
                <p className="text-xs text-zinc-500">notes created</p>
              </div>
              <div className="bg-zinc-800/50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-zinc-200 mb-2">
                  This Month
                </h3>
                <p className="text-2xl font-bold text-purple-400">
                  {stats.notesThisMonth}
                </p>
                <p className="text-xs text-zinc-500">notes created</p>
              </div>
            </div>

            {/* Top Tags */}
            <div className="bg-zinc-800/50 rounded-xl p-4">
              <h3 className="text-sm font-medium text-zinc-200 mb-3">
                Most Used Tags
              </h3>
              {stats.topTags.length > 0 ? (
                <div className="space-y-2">
                  {stats.topTags.map(([tag, count]) => (
                    <div key={tag} className="flex items-center gap-3">
                      <span className="text-sm text-purple-400">#{tag}</span>
                      <div className="flex-1 h-2 bg-zinc-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-600 to-violet-600 rounded-full transition-all duration-300"
                          style={{ width: `${(count / stats.topTags[0][1]) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-zinc-500 font-mono w-8 text-right">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500 italic">
                  No tags used yet
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-zinc-700/50 bg-zinc-800/30">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>Avg. note length: {stats.avgLength} words</span>
              <span>Total characters: {stats.totalChars.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  color,
  small = false
}) {
  const colorClasses = {
    purple: 'bg-purple-500/10 text-purple-400',
    violet: 'bg-violet-500/10 text-violet-400',
    blue: 'bg-blue-500/10 text-blue-400',
    green: 'bg-green-500/10 text-green-400',
    yellow: 'bg-yellow-500/10 text-yellow-400',
    orange: 'bg-orange-500/10 text-orange-400',
    pink: 'bg-pink-500/10 text-pink-400',
  };

  return (
    <div className={cn(
      'bg-zinc-800/50 rounded-xl transition-all hover:scale-105',
      small ? 'p-3' : 'p-4'
    )}>
      <div className="flex items-center gap-2 mb-1">
        <span className={small ? 'text-base' : 'text-lg'}>{icon}</span>
        <span className={cn(
          'text-zinc-400',
          small ? 'text-xs' : 'text-sm'
        )}>
          {label}
        </span>
      </div>
      <p className={cn(
        'font-bold',
        colorClasses[color],
        small ? 'text-xl' : 'text-2xl'
      )}>
        {value}
      </p>
    </div>
  );
}
