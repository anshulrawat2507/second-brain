'use client';

import { cn } from '@/lib/utils';

export function LoadingSpinner({ size = 'md', className }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div
      className={cn('rounded-full animate-spin', sizes[size], className)}
      style={{ border: '2px solid var(--color-border)', borderTopColor: 'var(--color-accent)' }}
    />
  );
}

export function LoadingScreen({ message = 'Loading your workspace' }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      {/* Minimal animated loader */}
      <div className="relative mb-8">
        {/* Outer ring */}
        <div className="w-16 h-16 rounded-full animate-spin" style={{
          border: '2px solid transparent',
          borderTopColor: 'var(--color-accent)',
          borderRightColor: 'var(--color-accent)',
          opacity: 0.3,
          animationDuration: '3s',
        }} />
        {/* Inner ring */}
        <div className="absolute inset-2 rounded-full animate-spin" style={{
          border: '2px solid transparent',
          borderTopColor: 'var(--color-accent)',
          animationDuration: '1.5s',
          animationDirection: 'reverse',
        }} />
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-accent)' }} />
        </div>
      </div>

      {/* Message */}
      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
        {message}
        <span className="inline-flex ml-1">
          <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
          <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
          <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
        </span>
      </p>
    </div>
  );
}

export default LoadingScreen;
