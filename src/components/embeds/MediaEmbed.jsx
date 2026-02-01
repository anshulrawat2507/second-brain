'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { LinkPastePreview, detectPlatform, platforms } from './LinkPastePreview';

// Detect embed type from URL
function detectEmbedType(url) {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('reddit.com')) return 'reddit';
  return 'unknown';
}

// Extract YouTube video ID
function getYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

// Extract Twitter/X post ID
function getTwitterId(url) {
  const match = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
  return match ? match[1] : null;
}

// Extract Instagram post ID
function getInstagramId(url) {
  const match = url.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

export function MediaEmbed({ url, className }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const type = detectEmbedType(url);

  if (type === 'youtube') {
    const videoId = getYouTubeId(url);
    if (!videoId) return <LinkPreview url={url} />;

    return (
      <div className={cn('relative w-full rounded-xl overflow-hidden bg-black', className)}>
        <div className="relative pt-[56.25%]">
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
              <span className="text-2xl animate-pulse">▶️</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (type === 'twitter') {
    const tweetId = getTwitterId(url);
    if (!tweetId) return <LinkPreview url={url} />;

    return (
      <div className={cn('w-full max-w-lg', className)}>
        <TwitterEmbed tweetId={tweetId} url={url} />
      </div>
    );
  }

  if (type === 'instagram') {
    const postId = getInstagramId(url);
    if (!postId) return <LinkPreview url={url} />;

    return (
      <div className={cn('w-full max-w-lg', className)}>
        <InstagramEmbed postId={postId} url={url} />
      </div>
    );
  }

  return <LinkPreview url={url} />;
}

// Twitter Embed Component
function TwitterEmbed({ tweetId, url }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load Twitter widget script
    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      if (window.twttr) {
        // @ts-ignore
        window.twttr.widgets.load();
        setIsLoading(false);
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [tweetId]);

  return (
    <div className="rounded-xl overflow-hidden border border-zinc-700/50 bg-zinc-900">
      {isLoading && (
        <div className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-800 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-zinc-800 rounded animate-pulse w-1/3" />
            <div className="h-3 bg-zinc-800 rounded animate-pulse w-2/3" />
          </div>
        </div>
      )}
      <blockquote className="twitter-tweet" data-theme="dark">
        <a href={url}>Loading tweet...</a>
      </blockquote>
    </div>
  );
}

// Instagram Embed Component
function InstagramEmbed({ postId, url }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load Instagram embed script
    const script = document.createElement('script');
    script.src = 'https://www.instagram.com/embed.js';
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      if (window.instgrm) {
        // @ts-ignore
        window.instgrm.Embeds.process();
        setIsLoading(false);
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [postId]);

  return (
    <div className="rounded-xl overflow-hidden border border-zinc-700/50 bg-zinc-900">
      {isLoading && (
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-800 animate-pulse" />
            <div className="h-4 bg-zinc-800 rounded animate-pulse w-24" />
          </div>
          <div className="aspect-square bg-zinc-800 rounded animate-pulse" />
        </div>
      )}
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={url}
        data-instgrm-version="14"
      >
        <a href={url}>View on Instagram</a>
      </blockquote>
    </div>
  );
}

// Generic Link Preview for unknown URLs
function LinkPreview({ url }) {
  const [metadata, setMetadata] = useState(null);

  const domain = new URL(url).hostname;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 rounded-xl border border-zinc-700/50 bg-zinc-900 hover:bg-zinc-800 transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-lg">
          🔗
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-100 truncate group-hover:text-purple-400 transition-colors">
            {domain}
          </p>
          <p className="text-xs text-zinc-400 truncate">
            {url}
          </p>
        </div>
        <span className="text-zinc-400 group-hover:text-purple-400 transition-colors">
          ↗
        </span>
      </div>
    </a>
  );
}

// Saved Links Manager Component

// Platform Icon Components
const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#FF0000">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#000000">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#E4405F">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const RedditIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#FF4500">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
  </svg>
);

const LinkIconSmall = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const getPlatformIcon = (type) => {
  switch (type) {
    case 'youtube': return <YouTubeIcon />;
    case 'twitter': return <TwitterIcon />;
    case 'instagram': return <InstagramIcon />;
    case 'reddit': return <RedditIcon />;
    default: return <LinkIconSmall />;
  }
};

const getPlatformColor = (type) => {
  switch (type) {
    case 'youtube': return { bg: 'rgba(255, 0, 0, 0.1)', border: 'rgba(255, 0, 0, 0.3)', text: '#FF0000' };
    case 'twitter': return { bg: 'rgba(0, 0, 0, 0.1)', border: 'rgba(0, 0, 0, 0.3)', text: '#000000' };
    case 'instagram': return { bg: 'rgba(228, 64, 95, 0.1)', border: 'rgba(228, 64, 95, 0.3)', text: '#E4405F' };
    case 'reddit': return { bg: 'rgba(255, 69, 0, 0.1)', border: 'rgba(255, 69, 0, 0.3)', text: '#FF4500' };
    default: return { bg: 'rgba(63, 63, 70, 0.5)', border: 'rgba(82, 82, 91, 0.5)', text: '#a1a1aa' };
  }
};

const getPlatformName = (type) => {
  switch (type) {
    case 'youtube': return 'YouTube';
    case 'twitter': return 'X (Twitter)';
    case 'instagram': return 'Instagram';
    case 'reddit': return 'Reddit';
    default: return 'Link';
  }
};

const getYouTubeThumbnail = (url) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^#&?]*)/);
  return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null;
};

export function SavedLinksManager({ isOpen, onClose, onInsertEmbed }) {
  const [links, setLinks] = useState([]);
  const [newUrl, setNewUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);

  // Load saved links from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('second-brain-saved-links');
    if (saved) {
      setLinks(JSON.parse(saved));
    }
  }, [isOpen]);

  const saveLinks = (newLinks) => {
    setLinks(newLinks);
    localStorage.setItem('second-brain-saved-links', JSON.stringify(newLinks));
  };

  const handleUrlChange = (url) => {
    setNewUrl(url);
    // Show preview when a valid URL is entered
    try {
      new URL(url);
      const type = detectEmbedType(url);
      if (type !== 'unknown') {
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    } catch {
      setPreviewUrl(null);
    }
  };

  const addLink = () => {
    if (!newUrl.trim()) return;
    
    try {
      new URL(newUrl); // Validate URL
      const type = detectEmbedType(newUrl);
      const newLink = {
        id: Date.now().toString(),
        url: newUrl,
        type,
        created_at: new Date().toISOString(),
      };
      saveLinks([newLink, ...links]);
      setNewUrl('');
      setPreviewUrl(null);
    } catch {
      alert('Please enter a valid URL');
    }
  };

  const removeLink = (id) => {
    saveLinks(links.filter(l => l.id !== id));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 rounded-2xl shadow-2xl w-full max-w-2xl pointer-events-auto max-h-[85vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-700/50">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔗</span>
              <h2 className="text-lg font-bold text-zinc-100">
                Saved Links & Embeds
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Add Link */}
          <div className="p-4 border-b border-zinc-700/50 space-y-3">
            <div className="flex gap-2">
              <input
                type="url"
                value={newUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="Paste YouTube, X, Instagram, or Reddit URL..."
                className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700/50 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                onKeyDown={(e) => e.key === 'Enter' && addLink()}
              />
              <button
                onClick={addLink}
                disabled={!previewUrl}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg hover:opacity-90 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
            
            {/* Platform Icons */}
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <span>Supported:</span>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: 'rgba(255, 0, 0, 0.1)' }}>
                <YouTubeIcon /> <span className="hidden sm:inline">YouTube</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: 'rgba(0, 0, 0, 0.1)' }}>
                <TwitterIcon /> <span className="hidden sm:inline">X</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: 'rgba(228, 64, 95, 0.1)' }}>
                <InstagramIcon /> <span className="hidden sm:inline">Instagram</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: 'rgba(255, 69, 0, 0.1)' }}>
                <RedditIcon /> <span className="hidden sm:inline">Reddit</span>
              </div>
            </div>

            {/* Preview Card */}
            {previewUrl && (
              <div className="mt-3">
                <LinkPreviewCard url={previewUrl} />
              </div>
            )}
          </div>

          {/* Links List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {links.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                <span className="text-4xl mb-4 block">📎</span>
                <p>No saved links yet</p>
                <p className="text-sm">Paste a URL above to save it</p>
              </div>
            ) : (
              links.map((link) => {
                const colors = getPlatformColor(link.type);
                const thumbnail = link.type === 'youtube' ? getYouTubeThumbnail(link.url) : null;
                
                return (
                  <div
                    key={link.id}
                    className="rounded-xl border overflow-hidden group transition-all hover:shadow-lg"
                    style={{ borderColor: colors.border, background: 'rgb(39, 39, 42)' }}
                  >
                    {/* Platform Header */}
                    <div 
                      className="flex items-center gap-2 px-3 py-2"
                      style={{ background: colors.bg }}
                    >
                      {getPlatformIcon(link.type)}
                      <span className="text-sm font-semibold" style={{ color: colors.text }}>
                        {getPlatformName(link.type)}
                      </span>
                      <span className="text-xs text-zinc-500 ml-auto">
                        {new Date(link.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-3">
                      <div className="flex gap-3">
                        {/* YouTube Thumbnail */}
                        {thumbnail && (
                          <div className="w-32 h-20 rounded-lg overflow-hidden flex-shrink-0 relative">
                            <img 
                              src={thumbnail} 
                              alt="Thumbnail"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                                <span className="text-white text-sm ml-0.5">▶</span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-zinc-100 truncate">
                            {link.url}
                          </p>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-2 mt-2">
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 text-xs rounded-lg font-medium text-white transition-all hover:opacity-90"
                              style={{ backgroundColor: colors.text }}
                            >
                              Open ↗
                            </a>
                            <button
                              onClick={() => {
                                onInsertEmbed(link.url);
                                onClose();
                              }}
                              className="px-3 py-1.5 text-xs bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg hover:opacity-90 transition-all"
                            >
                              Insert Embed
                            </button>
                            <button
                              onClick={() => removeLink(link.id)}
                              className="px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/20 rounded-lg transition-all ml-auto"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Link Preview Card Component
function LinkPreviewCard({ url }) {
  const type = detectEmbedType(url);
  const colors = getPlatformColor(type);
  const thumbnail = type === 'youtube' ? getYouTubeThumbnail(url) : null;

  return (
    <div 
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: colors.border, background: 'rgb(39, 39, 42)' }}
    >
      <div 
        className="flex items-center gap-2 px-3 py-2"
        style={{ background: colors.bg }}
      >
        {getPlatformIcon(type)}
        <span className="text-sm font-semibold" style={{ color: colors.text }}>
          {getPlatformName(type)}
        </span>
        <span className="text-xs text-zinc-500 ml-auto">Preview</span>
      </div>
      <div className="p-3 flex gap-3">
        {thumbnail && (
          <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 relative">
            <img src={thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">
                <span className="text-white text-xs ml-0.5">▶</span>
              </div>
            </div>
          </div>
        )}
        <p className="text-sm text-zinc-400 truncate flex-1">{url}</p>
      </div>
    </div>
  );
}

// Parse content for embeddable links
export function parseEmbedsFromContent(content) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = content.match(urlRegex) || [];
  return matches.filter(url => detectEmbedType(url) !== 'unknown');
}
