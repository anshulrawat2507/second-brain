'use client';

import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function ThemeProvider({ children }) {
  const { theme, settings } = useAppStore();

  return (
    <div
      data-theme={theme.id}
      className={cn(settings.crt_effects && 'crt-effect')}
      style={{
        fontSize: `${settings.font_size}px`,
        lineHeight: settings.line_height,
      }}
    >
      {children}
    </div>
  );
}
