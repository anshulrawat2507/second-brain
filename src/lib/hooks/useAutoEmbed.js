'use client';

import { useCallback, useState, useEffect } from 'react';

// Detect platform from URL
export function detectPlatform(url) {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('reddit.com')) return 'reddit';
  return null;
}

// Extract URL from text
const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;

export function extractUrls(text) {
  return text.match(URL_REGEX) || [];
}

// Get YouTube video ID
export function getYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Get YouTube thumbnail
export function getYouTubeThumbnail(url) {
  const videoId = getYouTubeId(url);
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  }
  return null;
}

// Generate embed markdown for a URL
export function generateEmbedMarkdown(url) {
  const platform = detectPlatform(url);
  
  if (!platform) return url;
  
  const youtubeId = getYouTubeId(url);
  
  switch (platform) {
    case 'youtube':
      if (youtubeId) {
        // Return an embed block format that can be rendered
        return `\n\n<!-- embed:youtube:${url} -->\n[🎬 YouTube Video](${url})\n\n`;
      }
      return url;
    case 'twitter':
      return `\n\n<!-- embed:twitter:${url} -->\n[𝕏 Post](${url})\n\n`;
    case 'instagram':
      return `\n\n<!-- embed:instagram:${url} -->\n[📸 Instagram](${url})\n\n`;
    case 'reddit':
      return `\n\n<!-- embed:reddit:${url} -->\n[🤖 Reddit](${url})\n\n`;
    default:
      return url;
  }
}

// Storage key
const SAVED_LINKS_KEY = 'second-brain-saved-links';

// Zustand-like store for saved links
let savedLinksListeners = new Set();
let savedLinksState = [];

// Initialize from localStorage
if (typeof window !== 'undefined') {
  try {
    const stored = localStorage.getItem(SAVED_LINKS_KEY);
    if (stored) {
      savedLinksState = JSON.parse(stored).map((link) => ({
        ...link,
        savedAt: new Date(link.savedAt),
      }));
    }
  } catch (e) {
    console.error('Failed to load saved links:', e);
  }
}

function persistLinks() {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SAVED_LINKS_KEY, JSON.stringify(savedLinksState));
  }
  savedLinksListeners.forEach(listener => listener());
}

// Hook to use saved links
export function useSavedLinks() {
  const [links, setLinks] = useState(savedLinksState);

  useEffect(() => {
    const listener = () => setLinks([...savedLinksState]);
    savedLinksListeners.add(listener);
    return () => { savedLinksListeners.delete(listener); };
  }, []);

  const addLink = useCallback((url, noteId, noteTitle) => {
    const platform = detectPlatform(url);
    if (!platform) return null;
    
    // Check for duplicates
    const existing = savedLinksState.find(l => l.url === url);
    if (existing) return existing;
    
    const newLink = {
      id: crypto.randomUUID(),
      url,
      platform,
      thumbnail: platform === 'youtube' ? getYouTubeThumbnail(url) || undefined : undefined,
      savedAt: new Date(),
      noteId,
      noteTitle,
    };
    
    savedLinksState = [newLink, ...savedLinksState];
    persistLinks();
    
    return newLink;
  }, []);

  const removeLink = useCallback((id) => {
    savedLinksState = savedLinksState.filter(l => l.id !== id);
    persistLinks();
  }, []);

  const getLinksByPlatform = useCallback((platform) => {
    return links.filter(l => l.platform === platform);
  }, [links]);

  return {
    links,
    addLink,
    removeLink,
    getLinksByPlatform,
  };
}

// Hook for auto-detecting and embedding links on paste
export function useAutoEmbed(options) {
  const { addLink } = useSavedLinks();
  const [lastDetectedUrl, setLastDetectedUrl] = useState(null);
  const [lastPlatform, setLastPlatform] = useState(null);

  const handlePaste = useCallback((event) => {
    const pastedText = event.clipboardData?.getData('text') || '';
    const urls = extractUrls(pastedText);
    
    for (const url of urls) {
      const platform = detectPlatform(url);
      if (platform) {
        setLastDetectedUrl(url);
        setLastPlatform(platform);
        
        // Auto-save the link
        if (options?.autoSave !== false) {
          addLink(url, options?.noteId, options?.noteTitle);
        }
        
        options?.onLinkDetected?.(url, platform);
        break; // Only handle the first social media URL
      }
    }
  }, [addLink, options]);

  // Transform pasted URL to embed format
  const transformPastedUrl = useCallback((text) => {
    const urls = extractUrls(text);
    let result = text;
    
    for (const url of urls) {
      const platform = detectPlatform(url);
      if (platform) {
        const embedMarkdown = generateEmbedMarkdown(url);
        result = result.replace(url, embedMarkdown);
      }
    }
    
    return result;
  }, []);

  return {
    handlePaste,
    transformPastedUrl,
    lastDetectedUrl,
    lastPlatform,
    clearLastDetected: () => { setLastDetectedUrl(null); setLastPlatform(null); }
  };
}

// Extract all embedded links from note content
export function extractEmbeddedLinks(content) {
  const embedPattern = /<!-- embed:(\w+):(https?:\/\/[^\s]+) -->/g;
  const links = [];
  
  let match;
  while ((match = embedPattern.exec(content)) !== null) {
    links.push({ platform: match[1], url: match[2] });
  }
  
  // Also check for regular URLs
  const urls = extractUrls(content);
  for (const url of urls) {
    const platform = detectPlatform(url);
    if (platform && !links.some(l => l.url === url)) {
      links.push({ url, platform });
    }
  }
  
  return links;
}
