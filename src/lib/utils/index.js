import { v4 as uuidv4 } from 'uuid';

// Generate unique ID
export function generateId() {
  return uuidv4();
}

// Sanitize filename for file system
export function sanitizeFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100);
}

// Generate file path for a note
export function generateFilePath(userId, title, isQuickNote = false) {
  const sanitized = sanitizeFilename(title);
  const timestamp = Date.now();
  const folder = isQuickNote ? 'quick-notes' : 'notes';
  const extension = isQuickNote ? 'txt' : 'md';
  return `${userId}/${folder}/${sanitized}-${timestamp}.${extension}`;
}

// Count words in text
export function countWords(text) {
  if (!text || text.trim() === '') return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

// Count characters in text
export function countCharacters(text, includeSpaces = true) {
  if (!text) return 0;
  return includeSpaces ? text.length : text.replace(/\s/g, '').length;
}

// Estimate reading time (words per minute)
export function estimateReadingTime(wordCount, wpm = 200) {
  const minutes = Math.ceil(wordCount / wpm);
  if (minutes < 1) return 'Less than 1 min';
  if (minutes === 1) return '1 min read';
  return `${minutes} min read`;
}

// Format date for display
export function formatDate(date, format = 'short') {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'relative') {
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  if (format === 'long') {
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Truncate text with ellipsis
export function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

// Extract first line or title from markdown
export function extractTitle(content) {
  if (!content) return 'Untitled';
  
  // Try to find a heading
  const headingMatch = content.match(/^#+ (.+)$/m);
  if (headingMatch) return headingMatch[1].trim();
  
  // Otherwise use first line
  const firstLine = content.split('\n')[0].trim();
  return firstLine || 'Untitled';
}

// Debounce function
export function debounce(func, wait) {
  let timeout = null;
  
  return (...args) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Class name utility (similar to clsx)
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// Validate email format
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength
export function validatePassword(password) {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Parse tags from content (finds #tags)
export function extractTags(content) {
  const tagRegex = /#([a-zA-Z0-9_-]+)/g;
  const matches = content.match(tagRegex);
  if (!matches) return [];
  return [...new Set(matches.map(tag => tag.slice(1)))];
}

// Highlight search terms in text
export function highlightSearchTerm(text, searchTerm) {
  if (!searchTerm) return text;
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}
