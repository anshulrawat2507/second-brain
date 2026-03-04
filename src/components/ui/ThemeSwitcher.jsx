'use client';

import { useAppStore } from '@/lib/store';
import { themes } from '@/lib/constants/themes';

export function ThemeSwitcher({ isOpen, onClose }) {
  const { theme, setTheme } = useAppStore();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-sm pointer-events-auto animate-in fade-in zoom-in-95 duration-200"
          style={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Choose Theme</h2>
            <button onClick={onClose} className="p-2 rounded-xl transition-all duration-200" style={{ color: 'var(--color-text-muted)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="p-6 space-y-3">
            {themes.map((t) => {
              const isActive = theme?.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => { setTheme(t.id); onClose(); }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200"
                  style={{
                    borderColor: isActive ? 'var(--color-accent)' : 'var(--color-border)',
                    backgroundColor: isActive ? 'color-mix(in srgb, var(--color-accent) 10%, transparent)' : 'transparent',
                  }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg"
                    style={{ backgroundColor: t.colors.bgSecondary, border: `2px solid ${t.colors.border}` }}>
                    {t.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{t.name}</p>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{t.description}</p>
                  </div>
                  {isActive && (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-accent)' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default ThemeSwitcher;
