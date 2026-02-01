'use client';

import { useState } from 'react';
import { usePWA } from '@/hooks/usePWA';

export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, install, isOnline, updateAvailable, update } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if dismissed, already installed, or not installable
  if (dismissed || isInstalled || !isInstallable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-bg-secondary border border-border rounded-xl shadow-xl p-4 z-50 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="text-3xl">🧠</div>
        <div className="flex-1">
          <h3 className="font-semibold text-text-primary">Install Second Brain</h3>
          <p className="text-sm text-text-secondary mt-1">
            Install our app for a better experience with offline access and quick launch.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={install}
              className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
            >
              Install
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="px-4 py-2 text-text-secondary hover:text-text-primary text-sm transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-text-secondary hover:text-text-primary"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function PWAUpdatePrompt() {
  const { updateAvailable, update } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !updateAvailable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-accent/10 border border-accent rounded-xl shadow-xl p-4 z-50 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="text-2xl">✨</div>
        <div className="flex-1">
          <h3 className="font-semibold text-text-primary">Update Available</h3>
          <p className="text-sm text-text-secondary mt-1">
            A new version of Second Brain is available. Update now for the latest features!
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={update}
              className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
            >
              Update Now
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="px-4 py-2 text-text-secondary hover:text-text-primary text-sm transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OfflineIndicator() {
  const { isOnline } = usePWA();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-500 text-black text-center py-1 text-sm font-medium z-50">
      <span>📡 You're offline - Changes will sync when you're back online</span>
    </div>
  );
}
