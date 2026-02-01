'use client';

import { useAppStore } from '@/lib/store';
import { themes } from '@/lib/constants/themes';
import { cn } from '@/lib/utils';

export function ThemeSwitcher({ isOpen, onClose }) {
  const { theme, setTheme } = useAppStore();

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
          className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 rounded-2xl shadow-2xl shadow-black/50 w-full max-w-sm pointer-events-auto animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-800/50">
            <h2 className="text-lg font-bold text-zinc-100">
              Choose Theme
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 rounded-xl transition-all duration-200"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Theme Options */}
          <div className="p-6 space-y-3">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  onClose();
                }}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200',
                  theme?.id === t.id
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-zinc-700/50 hover:border-zinc-600 hover:bg-zinc-800/40'
                )}
              >
                {/* Theme Preview */}
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg"
                  style={{ 
                    backgroundColor: t.colors.bgSecondary,
                    border: `2px solid ${t.colors.border}`
                  }}
                >
                  {t.icon}
                </div>
                
                {/* Theme Info */}
                <div className="flex-1 text-left">
                  <p className="font-semibold text-zinc-200">
                    {t.name}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {t.description}
                  </p>
                </div>

                {/* Selected Indicator */}
                {theme?.id === t.id && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default ThemeSwitcher;
