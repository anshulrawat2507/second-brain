'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Input = forwardRef(function Input(
  { label, error, helperText, className, ...props },
  ref
) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-zinc-300">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full px-4 py-2.5 bg-zinc-900/50 border border-zinc-700 rounded-lg',
          'text-white placeholder-zinc-500',
          'focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500',
          'transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-red-500 focus:ring-red-500/50 focus:border-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-zinc-500">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };
