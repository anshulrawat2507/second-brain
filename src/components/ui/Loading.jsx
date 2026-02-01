'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';

export function LoadingSpinner({ size = 'md', className }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div
      className={cn(
        'border-2 border-zinc-700 border-t-purple-500 rounded-full animate-spin',
        sizes[size],
        className
      )}
    />
  );
}

export function LoadingScreen({ message = 'Loading your workspace' }) {
  const { theme } = useAppStore();
  const isDark = theme?.isDark ?? true;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-zinc-950">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-purple-500/5" />
      
      <div className="relative text-center z-10">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src={isDark ? '/logo-dark.svg' : '/logo-light.svg'}
            alt="Second Brain"
            width={200}
            height={50}
            priority
            className="mx-auto"
          />
        </div>
        
        {/* Loading spinner */}
        <div className="relative w-12 h-12 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-2 border-zinc-700" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" />
        </div>
        
        {/* Message */}
        <p className="text-sm text-zinc-400">
          {message}
          <span className="inline-flex ml-1">
            <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
            <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
            <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
          </span>
        </p>
      </div>
    </div>
  );
}

export default LoadingScreen;
