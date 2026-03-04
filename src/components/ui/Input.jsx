'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Input = forwardRef(function Input(
  { label, error, helperText, className, style, ...props },
  ref
) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full px-4 py-2.5 rounded-lg',
          'transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'focus:outline-none focus:ring-2',
          className
        )}
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          border: error ? '1px solid var(--color-error, #ef4444)' : '1px solid var(--color-border)',
          color: 'var(--color-text-primary)',
          '--tw-ring-color': error ? 'color-mix(in srgb, var(--color-error, #ef4444) 50%, transparent)' : 'color-mix(in srgb, var(--color-accent) 50%, transparent)',
          ...style,
        }}
        {...props}
      />
      {error && (
        <p className="text-sm" style={{ color: 'var(--color-error, #ef4444)' }}>{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };
