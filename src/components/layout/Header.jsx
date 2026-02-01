'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

export function Header({ 
  onSearchClick,
  onThemeClick,
  user 
}) {
  const router = useRouter();
  const { sidebarOpen, setSidebarOpen, theme } = useAppStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Determine if dark mode
  const isDark = theme?.id === 'purple-noir' || theme?.isDark === true;

  return (
    <header className="h-14 border-b border-zinc-700/50 bg-zinc-900 flex items-center justify-between px-4 sticky top-0 z-40">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {/* Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 3v18" />
          </svg>
        </button>

        {/* Logo */}
        <div className="flex items-center">
          {isDark ? (
            <Image
              src="/logo-dark.svg"
              alt="Second Brain"
              width={140}
              height={32}
              priority
              className="h-8 w-auto"
            />
          ) : (
            <Image
              src="/logo-light.svg"
              alt="Second Brain"
              width={140}
              height={32}
              priority
              className="h-8 w-auto"
            />
          )}
        </div>
      </div>

      {/* Center - Search */}
      <button
        onClick={onSearchClick}
        className="flex items-center gap-3 px-4 py-2 bg-zinc-950 border border-zinc-700/50 rounded-lg text-zinc-500 hover:border-zinc-600 transition-colors min-w-[240px]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <span className="flex-1 text-left text-sm">Search notes...</span>
        <kbd className="text-xs px-1.5 py-0.5 bg-zinc-900 border border-zinc-700/50 rounded">
          ⌘K
        </kbd>
      </button>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={onThemeClick}
          className="p-2 rounded-lg text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          aria-label="Change theme"
        >
          {isDark ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          )}
        </button>

        {/* User Menu */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-medium">
                {user.email?.[0]?.toUpperCase() || 'U'}
              </div>
            </button>

            {/* Dropdown */}
            {showUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-zinc-800 border border-zinc-700/50 rounded-xl shadow-xl z-50 animate-scaleIn">
                  <div className="px-4 py-2 border-b border-zinc-700/50">
                    <p className="text-sm font-medium text-zinc-100 truncate">
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-zinc-700/50 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
