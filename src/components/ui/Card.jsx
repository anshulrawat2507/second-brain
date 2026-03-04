'use client';

import { cn } from '@/lib/utils';

export function Card({ children, className, hover = false, onClick }) {
  return (
    <div
      className={cn(
        'backdrop-blur-sm rounded-xl transition-all duration-300',
        hover && 'cursor-pointer',
        className
      )}
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn('px-6 py-4', className)} style={{ borderBottom: '1px solid var(--color-border)' }}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={cn('text-lg font-semibold', className)} style={{ color: 'var(--color-text-primary)' }}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className }) {
  return (
    <div className={cn('px-6 py-4', className)}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className }) {
  return (
    <div className={cn('px-6 py-4', className)} style={{ borderTop: '1px solid var(--color-border)' }}>
      {children}
    </div>
  );
}
