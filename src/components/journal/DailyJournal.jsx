'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { cn, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const MOODS = [
  { emoji: '😊', label: 'Great', color: 'green' },
  { emoji: '🙂', label: 'Good', color: 'blue' },
  { emoji: '😐', label: 'Okay', color: 'yellow' },
  { emoji: '😔', label: 'Low', color: 'orange' },
  { emoji: '😢', label: 'Bad', color: 'red' },
];

const JOURNAL_TEMPLATE = `# Daily Journal - {{date}}

## 🌅 Morning Reflection
What are you grateful for today?
- 

## 🎯 Today's Goals
What do you want to accomplish?
- [ ] 
- [ ] 
- [ ] 

## 💭 Thoughts & Notes


## 🌙 Evening Review
How did your day go? What did you learn?


---
*Mood: {{mood}}*
`;

export function DailyJournal({ isOpen, onClose, onOpenNote }) {
  const { notes } = useAppStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // Get journal entries (notes that start with "Daily Journal")
  const journalEntries = useMemo(() => {
    return notes.filter(n => 
      !n.is_deleted && 
      (n.title?.startsWith('Daily Journal') || n.tags?.includes('journal'))
    );
  }, [notes]);

  // Map dates to journal entries
  const entriesByDate = useMemo(() => {
    const map = new Map();
    journalEntries.forEach(note => {
      const dateStr = new Date(note.created_at).toDateString();
      map.set(dateStr, note);
    });
    return map;
  }, [journalEntries]);

  // Calculate streak
  const streak = useMemo(() => {
    let count = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      if (entriesByDate.has(checkDate.toDateString())) {
        count++;
      } else if (i > 0) {
        break;
      }
    }
    return count;
  }, [entriesByDate]);

  // Get calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    
    const days = [];
    
    // Padding for start of month
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }
    
    // Days of month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  }, [currentMonth]);

  // Create today's journal entry
  const createTodayEntry = async (mood) => {
    setIsCreating(true);
    try {
      const today = new Date();
      const dateStr = formatDate(today.toISOString(), 'long');
      const content = JOURNAL_TEMPLATE
        .replace('{{date}}', dateStr)
        .replace('{{mood}}', mood || '😊 Great');

      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Daily Journal - ${dateStr}`,
          content,
          tags: ['journal', 'daily'],
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Journal entry created!');
        onOpenNote(data.data);
        onClose();
      } else {
        toast.error('Failed to create journal entry');
      }
    } catch (error) {
      console.error('Error creating journal:', error);
      toast.error('Failed to create journal entry');
    } finally {
      setIsCreating(false);
    }
  };

  // Check if today has an entry
  const todayEntry = entriesByDate.get(new Date().toDateString());

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="backdrop-blur-xl border rounded-2xl shadow-2xl w-full max-w-2xl pointer-events-auto animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] overflow-hidden flex flex-col"
          style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-4">
              <span className="text-3xl">📔</span>
              <div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  Daily Journal
                </h2>
                <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  {journalEntries.length} entries • 🔥 {streak} day streak
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl transition-all duration-200"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-track-transparent">
            {/* Today's Entry Section */}
            <div className="mb-6 p-5 rounded-2xl border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                Today - {formatDate(new Date().toISOString(), 'long')}
              </h3>
              
              {todayEntry ? (
                <div className="flex items-center justify-between">
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    ✅ You've written today's entry
                  </p>
                  <button
                    onClick={() => {
                      onOpenNote(todayEntry);
                      onClose();
                    }}
                    className="px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all"
                    style={{ background: 'var(--color-accent)', boxShadow: '0 10px 15px -3px var(--color-accent-muted)' }}
                  >
                    Open Entry
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                    How are you feeling today?
                  </p>
                  <div className="flex gap-2 mb-3">
                    {MOODS.map((mood) => (
                      <button
                        key={mood.label}
                        onClick={() => createTodayEntry(`${mood.emoji} ${mood.label}`)}
                        disabled={isCreating}
                        className="flex-1 py-4 rounded-xl text-center transition-all duration-200 hover:scale-105 border"
                        style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
                        title={mood.label}
                      >
                        <span className="text-2xl">{mood.emoji}</span>
                        <p className="text-[10px] mt-1.5 font-medium" style={{ color: 'var(--color-text-tertiary)' }}>{mood.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Calendar */}
            <div className="rounded-2xl p-5 border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="p-2.5 rounded-xl transition-all duration-200"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  ◀
                </button>
                <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="p-2.5 rounded-xl transition-all duration-200"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  ▶
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-[10px] font-medium py-2" style={{ color: 'var(--color-text-muted)' }}>
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, i) => {
                  if (!date) {
                    return <div key={`empty-${i}`} className="aspect-square" />;
                  }
                  
                  const hasEntry = entriesByDate.has(date.toDateString());
                  const isToday = date.toDateString() === new Date().toDateString();
                  const entry = entriesByDate.get(date.toDateString());
                  
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => {
                        if (entry) {
                          onOpenNote(entry);
                          onClose();
                        } else {
                          setSelectedDate(date);
                        }
                      }}
                      className={cn(
                        'aspect-square rounded-xl text-sm flex items-center justify-center transition-all duration-200 relative font-medium',
                        date > new Date() && 'opacity-30 cursor-not-allowed'
                      )}
                      style={{
                        ...(isToday ? { outline: '2px solid var(--color-accent)', outlineOffset: '2px' } : {}),
                        ...(hasEntry
                          ? { background: 'var(--color-accent)', color: '#fff', boxShadow: '0 10px 15px -3px var(--color-accent-muted)' }
                          : { color: 'var(--color-text-secondary)' }),
                      }}
                      disabled={date > new Date()}
                    >
                      {date.getDate()}
                      {hasEntry && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent Entries */}
            {journalEntries.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                  Recent Entries
                </h3>
                <div className="space-y-2">
                  {journalEntries.slice(0, 5).map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => {
                        onOpenNote(entry);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 text-left border group"
                      style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
                    >
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{entry.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                          {formatDate(entry.created_at, 'long')}
                        </p>
                      </div>
                      <span className="transition-colors" style={{ color: 'var(--color-text-muted)' }}>→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
