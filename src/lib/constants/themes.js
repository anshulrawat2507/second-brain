// Second Brain - Theme Definitions
// Only 2 themes: Purple Noir (dark) and Clean Light

export const themes = [
  {
    id: 'purple-noir',
    name: 'Purple Noir',
    isDark: true,
    description: 'Dark theme with purple accents',
    icon: '🌙',
    colors: {
      bgPrimary: '#0d0d0f',
      bgSecondary: '#121214',
      textPrimary: '#f5f5f7',
      textSecondary: '#a0a0a8',
      accent: '#8b5cf6',
      border: '#2a2a2f',
      highlight: '#a78bfa',
      error: '#ef4444',
      success: '#22c55e',
      // Legacy support
      background: '#0d0d0f',
      backgroundSecondary: '#121214',
      primaryText: '#f5f5f7',
      secondaryText: '#a0a0a8',
      borders: '#2a2a2f',
      highlights: '#a78bfa',
    },
  },
  {
    id: 'clean-light',
    name: 'Clean Light',
    isDark: false,
    description: 'Light theme with teal accents',
    icon: '☀️',
    colors: {
      bgPrimary: '#ffffff',
      bgSecondary: '#f8f8fa',
      textPrimary: '#111113',
      textSecondary: '#5c5c66',
      accent: '#0d9488',
      border: '#e4e4e8',
      highlight: '#14b8a6',
      error: '#ef4444',
      success: '#22c55e',
      // Legacy support
      background: '#ffffff',
      backgroundSecondary: '#f8f8fa',
      primaryText: '#111113',
      secondaryText: '#5c5c66',
      borders: '#e4e4e8',
      highlights: '#14b8a6',
    },
  },
];

// Default theme
export const defaultTheme = themes[0]; // purple-noir

// Helper to get theme by ID
export function getThemeById(id) {
  return themes.find(t => t.id === id) || defaultTheme;
}

// Type definition for Theme (for JSDoc)
export const Theme = null; // Placeholder for type compatibility

export default themes;
