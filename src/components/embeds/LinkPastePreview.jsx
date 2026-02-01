'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Platform Icons as SVG components
const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const RedditIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
  </svg>
);

const LinkIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Platform detection and metadata
const platforms = {
  youtube: {
    name: 'YouTube',
    icon: <YouTubeIcon />,
    color: '#FF0000',
    bgColor: 'rgba(255, 0, 0, 0.1)',
    borderColor: 'rgba(255, 0, 0, 0.3)',
    extractId: (url) => {
      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^#&?]*)/);
      return match ? match[1] : null;
    },
    getDisplayInfo: (url) => {
      const videoId = platforms.youtube.extractId(url);
      return {
        title: 'YouTube Video',
        subtitle: videoId ? `Video ID: ${videoId}` : url,
      };
    },
  },
  twitter: {
    name: 'X (Twitter)',
    icon: <TwitterIcon />,
    color: '#000000',
    bgColor: 'rgba(0, 0, 0, 0.1)',
    borderColor: 'rgba(0, 0, 0, 0.3)',
    extractId: (url) => {
      const match = url.match(/(?:twitter\.com|x\.com)\/(\w+)\/status\/(\d+)/);
      return match ? match[2] : null;
    },
    getDisplayInfo: (url) => {
      const match = url.match(/(?:twitter\.com|x\.com)\/(\w+)\/status\/(\d+)/);
      return {
        title: match ? `Post by @${match[1]}` : 'X Post',
        subtitle: match ? `Tweet ID: ${match[2]}` : url,
      };
    },
  },
  instagram: {
    name: 'Instagram',
    icon: <InstagramIcon />,
    color: '#E4405F',
    bgColor: 'linear-gradient(45deg, rgba(245,96,64,0.1), rgba(188,42,141,0.1), rgba(138,58,185,0.1))',
    borderColor: 'rgba(228, 64, 95, 0.3)',
    extractId: (url) => {
      const match = url.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
      return match ? match[1] : null;
    },
    getDisplayInfo: (url) => {
      const postId = platforms.instagram.extractId(url);
      const isReel = url.includes('/reel/');
      return {
        title: isReel ? 'Instagram Reel' : 'Instagram Post',
        subtitle: postId ? `Post ID: ${postId}` : url,
      };
    },
  },
  reddit: {
    name: 'Reddit',
    icon: <RedditIcon />,
    color: '#FF4500',
    bgColor: 'rgba(255, 69, 0, 0.1)',
    borderColor: 'rgba(255, 69, 0, 0.3)',
    extractId: (url) => {
      const match = url.match(/reddit\.com\/r\/(\w+)\/comments\/(\w+)/);
      return match ? match[2] : null;
    },
    getDisplayInfo: (url) => {
      const match = url.match(/reddit\.com\/r\/(\w+)\/comments\/(\w+)/);
      return {
        title: match ? `r/${match[1]}` : 'Reddit Post',
        subtitle: match ? `Post ID: ${match[2]}` : url,
      };
    },
  },
};

function detectPlatform(url) {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('reddit.com')) return 'reddit';
  return 'unknown';
}

export function LinkPastePreview({ url, onRemove, onEmbed, className, compact = false }) {
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const platformKey = detectPlatform(url);
  const platform = platforms[platformKey];

  // Get YouTube thumbnail
  useEffect(() => {
    if (platformKey === 'youtube') {
      const videoId = platforms.youtube.extractId(url);
      if (videoId) {
        setThumbnailUrl(`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`);
      }
    }
  }, [url, platformKey]);

  if (!platform) {
    // Unknown platform - show generic link preview
    return (
      <div className={cn(
        'flex items-center gap-3 p-3 rounded-xl border bg-zinc-900 border-zinc-700/50 group',
        className
      )}>
        <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
          <LinkIcon />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-100 truncate">
            External Link
          </p>
          <p className="text-xs text-zinc-400 truncate">{url}</p>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-zinc-400 hover:text-purple-400 transition-colors"
        >
          ↗
        </a>
      </div>
    );
  }

  const { title, subtitle } = platform.getDisplayInfo(url);

  if (compact) {
    return (
      <div 
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all hover:scale-105 cursor-pointer',
          className
        )}
        style={{ 
          background: platform.bgColor,
          borderColor: platform.borderColor,
        }}
        onClick={() => window.open(url, '_blank')}
      >
        <span style={{ color: platform.color }}>{platform.icon}</span>
        <span className="text-sm font-medium text-zinc-100">{platform.name}</span>
        <span className="text-xs text-zinc-400">↗</span>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        'rounded-xl border overflow-hidden transition-all hover:shadow-lg group',
        className
      )}
      style={{ 
        background: 'rgb(24, 24, 27)',
        borderColor: platform.borderColor,
      }}
    >
      {/* Platform Header */}
      <div 
        className="flex items-center gap-2 px-4 py-2"
        style={{ background: platform.bgColor }}
      >
        <span style={{ color: platform.color }}>{platform.icon}</span>
        <span className="text-sm font-semibold" style={{ color: platform.color }}>
          {platform.name}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* YouTube Thumbnail */}
        {platformKey === 'youtube' && thumbnailUrl && (
          <div className="relative mb-3 rounded-lg overflow-hidden">
            <img 
              src={thumbnailUrl} 
              alt="Video thumbnail"
              className="w-full aspect-video object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center">
                <span className="text-white text-2xl ml-1">▶</span>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="space-y-1">
          <h3 className="font-semibold text-zinc-100">{title}</h3>
          <p className="text-sm text-zinc-400 truncate">{subtitle}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all hover:opacity-90"
            style={{ backgroundColor: platform.color }}
          >
            Open in {platform.name}
            <span>↗</span>
          </a>
          {onEmbed && (
            <button
              onClick={onEmbed}
              className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-100 hover:bg-zinc-800 transition-all"
            >
              Embed
            </button>
          )}
          {onRemove && (
            <button
              onClick={onRemove}
              className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Inline link badge for editor
export function LinkBadge({ url, onClick }) {
  const platformKey = detectPlatform(url);
  const platform = platforms[platformKey];

  if (!platform) {
    return (
      <span 
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 text-xs cursor-pointer hover:bg-zinc-700 transition-colors"
        onClick={onClick}
      >
        🔗 Link
      </span>
    );
  }

  return (
    <span 
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium cursor-pointer transition-all hover:scale-105"
      style={{ 
        background: platform.bgColor,
        color: platform.color,
        border: `1px solid ${platform.borderColor}`,
      }}
      onClick={onClick}
    >
      <span className="w-4 h-4">{platform.icon}</span>
      {platform.name}
    </span>
  );
}

// Hook to detect paste and show preview
export function useLinkPasteDetection(onLinkPaste) {
  useEffect(() => {
    const handlePaste = (e) => {
      const text = e.clipboardData?.getData('text');
      if (!text) return;

      // Check if it's a URL
      try {
        new URL(text);
        const platform = detectPlatform(text);
        if (platform !== 'unknown') {
          onLinkPaste(text, platform);
        }
      } catch {
        // Not a valid URL, ignore
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [onLinkPaste]);
}

// Export platforms for external use
export { platforms, detectPlatform };
