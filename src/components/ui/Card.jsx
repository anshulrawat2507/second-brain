'use client';

import { cn } from '@/lib/utils';

export function Card({ children, className, hover = false, onClick }) {
  return (
    <div
      className={cn(
        'bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl',
        hover && 'hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn('px-6 py-4 border-b border-zinc-800', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={cn('text-lg font-semibold text-white', className)}>
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
    <div className={cn('px-6 py-4 border-t border-zinc-800', className)}>
      {children}
    </div>
  );
}
