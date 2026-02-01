'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import { Header } from '@/components/layout';
import { LoadingScreen } from '@/components/ui';
import toast from 'react-hot-toast';

const DashboardBackground = dynamic(
  () => import('@/components/three/DashboardBackground').then(mod => ({ default: mod.DashboardBackground })),
  { ssr: false }
);

// Icons
const Icons = {
  back: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>,
  link: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>,
  plus: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>,
  grid: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
  list: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>,
  search: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>,
  external: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>,
  copy: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>,
  trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>,
  edit: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
  star: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  starFilled: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  play: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>,
  sparkles: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>,
};

// Platform detection and colors
const platformConfig = {
  youtube: { 
    bg: 'from-red-500/20 to-red-600/10', 
    border: 'border-red-500/30',
    accent: 'text-red-400',
    icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
  },
  twitter: { 
    bg: 'from-zinc-700/30 to-zinc-800/20', 
    border: 'border-zinc-500/30',
    accent: 'text-zinc-300',
    icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
  },
  github: { 
    bg: 'from-zinc-600/20 to-zinc-700/10', 
    border: 'border-zinc-500/30',
    accent: 'text-zinc-300',
    icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
  },
  reddit: { 
    bg: 'from-orange-500/20 to-orange-600/10', 
    border: 'border-orange-500/30',
    accent: 'text-orange-400',
    icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#FF4500"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701z"/></svg>
  },
  instagram: { 
    bg: 'from-pink-500/20 via-purple-500/15 to-orange-500/10', 
    border: 'border-pink-500/30',
    accent: 'text-pink-400',
    icon: <svg viewBox="0 0 24 24" className="w-5 h-5"><defs><linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#FFDC80" /><stop offset="50%" stopColor="#E1306C" /><stop offset="100%" stopColor="#833AB4" /></linearGradient></defs><path fill="url(#ig-grad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/></svg>
  },
  default: { 
    bg: 'from-purple-500/20 to-violet-600/10', 
    border: 'border-purple-500/30',
    accent: 'text-purple-400',
    icon: Icons.link
  },
};

function detectPlatform(url) {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
  if (url.includes('github.com')) return 'github';
  if (url.includes('reddit.com')) return 'reddit';
  if (url.includes('instagram.com')) return 'instagram';
  return 'default';
}

function getYouTubeThumbnail(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
  }
  return null;
}

// Beautiful Flashcard-style Bookmark Card
function BookmarkCard({ bookmark, onOpen, onDelete, onToggleFavorite, isGrid = true }) {
  const [copied, setCopied] = useState(false);
  const platform = detectPlatform(bookmark.url);
  const config = platformConfig[platform];
  const thumbnail = platform === 'youtube' ? getYouTubeThumbnail(bookmark.url) : bookmark.preview_image_url;
  
  const hostname = (() => {
    try { return new URL(bookmark.url).hostname.replace('www.', ''); }
    catch { return bookmark.url; }
  })();

  const copyUrl = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(bookmark.url);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (isGrid) {
    return (
      <div 
        className={`group relative bg-gradient-to-br ${config.bg} backdrop-blur-sm border ${config.border} rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1`}
      >
        {/* Thumbnail / Preview */}
        <div 
          className="relative h-40 cursor-pointer overflow-hidden"
          onClick={() => onOpen(bookmark)}
        >
          {thumbnail ? (
            <>
              <img 
                src={thumbnail} 
                alt={bookmark.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {platform === 'youtube' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-14 h-14 rounded-full bg-red-600/90 flex items-center justify-center shadow-lg">
                    {Icons.play}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-zinc-800/50 flex items-center justify-center">
              <div className="text-zinc-600 opacity-50">
                {config.icon}
              </div>
            </div>
          )}
          
          {/* Platform Badge */}
          <div className={`absolute top-3 left-3 p-2 rounded-xl bg-zinc-900/80 backdrop-blur-sm ${config.accent}`}>
            {config.icon}
          </div>

          {/* Favorite Badge */}
          {bookmark.is_favorite && (
            <div className="absolute top-3 right-3 p-2 rounded-xl bg-zinc-900/80 backdrop-blur-sm text-yellow-400">
              {Icons.starFilled}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <h3 
            className="font-semibold text-zinc-100 line-clamp-2 cursor-pointer hover:text-purple-300 transition-colors leading-snug"
            onClick={() => onOpen(bookmark)}
          >
            {bookmark.title || 'Untitled'}
          </h3>
          
          <p className="text-xs text-zinc-500 flex items-center gap-1.5">
            {config.icon}
            <span className="truncate">{hostname}</span>
          </p>

          {bookmark.description && (
            <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">
              {bookmark.description}
            </p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {bookmark.category && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/20">
                {bookmark.category}
              </span>
            )}
            {bookmark.tags?.slice(0, 2).map(tag => (
              <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-zinc-800/50 text-zinc-400">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Actions - Hover overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-zinc-900/95 via-zinc-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(bookmark); }}
                className={`p-2 rounded-lg transition-colors ${bookmark.is_favorite ? 'text-yellow-400 bg-yellow-500/10' : 'text-zinc-400 hover:text-yellow-400 hover:bg-zinc-800'}`}
              >
                {bookmark.is_favorite ? Icons.starFilled : Icons.star}
              </button>
              <button
                onClick={copyUrl}
                className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                {copied ? Icons.check : Icons.copy}
              </button>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete?.(bookmark.id); }}
              className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              {Icons.trash}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div 
      className={`group flex items-center gap-4 p-4 bg-gradient-to-r ${config.bg} backdrop-blur-sm border ${config.border} rounded-xl hover:border-purple-500/40 transition-all duration-200`}
    >
      {/* Thumbnail */}
      <div 
        className="relative w-24 h-16 rounded-lg overflow-hidden cursor-pointer flex-shrink-0 bg-zinc-800"
        onClick={() => onOpen(bookmark)}
      >
        {thumbnail ? (
          <img src={thumbnail} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600">
            {config.icon}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 
          className="font-medium text-zinc-100 truncate cursor-pointer hover:text-purple-300 transition-colors"
          onClick={() => onOpen(bookmark)}
        >
          {bookmark.title || 'Untitled'}
        </h3>
        <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
          {config.icon}
          <span className="truncate">{hostname}</span>
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          {bookmark.category && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-300">
              {bookmark.category}
            </span>
          )}
          {bookmark.click_count > 0 && (
            <span className="text-xs text-zinc-500">👁 {bookmark.click_count}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(bookmark); }}
          className={`p-2 rounded-lg transition-colors ${bookmark.is_favorite ? 'text-yellow-400' : 'text-zinc-500 hover:text-yellow-400'}`}
        >
          {bookmark.is_favorite ? Icons.starFilled : Icons.star}
        </button>
        <button onClick={copyUrl} className="p-2 text-zinc-500 hover:text-zinc-200 rounded-lg transition-colors">
          {copied ? Icons.check : Icons.copy}
        </button>
        <button
          onClick={() => onOpen(bookmark)}
          className="p-2 text-zinc-500 hover:text-purple-400 rounded-lg transition-colors"
        >
          {Icons.external}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete?.(bookmark.id); }}
          className="p-2 text-zinc-500 hover:text-red-400 rounded-lg transition-colors"
        >
          {Icons.trash}
        </button>
      </div>
    </div>
  );
}

// Add Bookmark Form
function AddBookmarkForm({ onSubmit, onCancel }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    await onSubmit({ url: url.trim() });
    setUrl('');
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <div className="flex-1 relative">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a URL to save..."
          className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
          autoFocus
        />
      </div>
      <button
        type="submit"
        disabled={!url.trim() || loading}
        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-medium rounded-xl hover:from-purple-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          Icons.plus
        )}
        Save
      </button>
    </form>
  );
}

export default function BookmarksPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState('all'); // all, favorites, youtube, twitter, etc.

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      fetchBookmarks();
    };
    checkAuth();
  }, [router]);

  const fetchBookmarks = async () => {
    try {
      const response = await fetch('/api/bookmarks');
      const result = await response.json();
      if (result.success) {
        setBookmarks(result.data);
      }
    } catch (error) {
      toast.error('Failed to load bookmarks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (result.success) {
        setBookmarks(prev => [result.data, ...prev]);
        setShowAddForm(false);
        toast.success('Bookmark saved!');
      } else {
        toast.error(result.error || 'Failed to save');
      }
    } catch (error) {
      toast.error('Failed to save bookmark');
    }
  };

  const handleOpen = async (bookmark) => {
    // Track click
    await fetch(`/api/bookmarks/${bookmark.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incrementClick: true })
    });
    setBookmarks(prev => prev.map(b => 
      b.id === bookmark.id ? { ...b, click_count: (b.click_count || 0) + 1 } : b
    ));
    window.open(bookmark.url, '_blank');
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this bookmark?')) return;
    try {
      const response = await fetch(`/api/bookmarks/${id}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) {
        setBookmarks(prev => prev.filter(b => b.id !== id));
        toast.success('Deleted');
      }
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleToggleFavorite = async (bookmark) => {
    try {
      const response = await fetch(`/api/bookmarks/${bookmark.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: !bookmark.is_favorite })
      });
      const result = await response.json();
      if (result.success) {
        setBookmarks(prev => prev.map(b => b.id === bookmark.id ? result.data : b));
      }
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  // Filter bookmarks
  const filteredBookmarks = bookmarks.filter(b => {
    if (filter === 'favorites') return b.is_favorite;
    if (filter !== 'all') return detectPlatform(b.url) === filter;
    return true;
  }).filter(b => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return b.title?.toLowerCase().includes(q) || 
           b.url.toLowerCase().includes(q) ||
           b.description?.toLowerCase().includes(q);
  });

  const counts = {
    all: bookmarks.length,
    favorites: bookmarks.filter(b => b.is_favorite).length,
    youtube: bookmarks.filter(b => detectPlatform(b.url) === 'youtube').length,
    twitter: bookmarks.filter(b => detectPlatform(b.url) === 'twitter').length,
    github: bookmarks.filter(b => detectPlatform(b.url) === 'github').length,
    instagram: bookmarks.filter(b => detectPlatform(b.url) === 'instagram').length,
    reddit: bookmarks.filter(b => detectPlatform(b.url) === 'reddit').length,
  };

  if (isLoading) {
    return <LoadingScreen message="Loading your bookmarks..." />;
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-950 relative overflow-hidden">
      <DashboardBackground />
      
      <div className="relative z-10 flex flex-col h-full">
        <Header />
        
        {/* Page Header */}
        <div className="border-b border-zinc-700/50 bg-zinc-900/60 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="p-2 hover:bg-zinc-800/50 rounded-lg transition-all text-zinc-400 hover:text-purple-400"
                >
                  {Icons.back}
                </button>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-400">
                    {Icons.sparkles}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-zinc-100">Saved Links</h1>
                    <p className="text-sm text-zinc-400">{bookmarks.length} bookmarks in your collection</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* View Toggle */}
                <div className="flex items-center bg-zinc-800/50 rounded-xl p-1 border border-zinc-700/50">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-purple-500 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
                  >
                    {Icons.grid}
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-purple-500 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
                  >
                    {Icons.list}
                  </button>
                </div>
                
                {/* Add Button */}
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-medium rounded-xl hover:from-purple-500 hover:to-violet-500 transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2"
                >
                  {Icons.plus}
                  Add Bookmark
                </button>
              </div>
            </div>

            {/* Add Form */}
            {showAddForm && (
              <div className="mb-6 p-4 bg-zinc-800/30 rounded-2xl border border-zinc-700/50">
                <AddBookmarkForm onSubmit={handleCreate} onCancel={() => setShowAddForm(false)} />
              </div>
            )}

            {/* Filters */}
            <div className="flex items-center gap-4 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                  {Icons.search}
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search bookmarks..."
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-purple-500/50 transition-all"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'favorites', label: '⭐ Favorites' },
                  { id: 'youtube', label: '▶ YouTube' },
                  { id: 'twitter', label: '𝕏 Twitter' },
                  { id: 'github', label: '🐙 GitHub' },
                  { id: 'instagram', label: '📸 Instagram' },
                  { id: 'reddit', label: '🤖 Reddit' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                      filter === f.id
                        ? 'bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/30'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                    }`}
                  >
                    {f.label}
                    {counts[f.id] > 0 && (
                      <span className="ml-1.5 text-xs opacity-60">({counts[f.id]})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bookmarks Grid/List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {filteredBookmarks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-20 h-20 rounded-3xl bg-zinc-800/50 flex items-center justify-center mb-4 text-zinc-600">
                  {Icons.link}
                </div>
                <p className="text-lg text-zinc-400">No bookmarks yet</p>
                <p className="text-sm text-zinc-500 mt-1">Save your first link to get started</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-4 px-4 py-2 bg-purple-500/20 text-purple-300 rounded-xl hover:bg-purple-500/30 transition-all"
                >
                  Add your first bookmark
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredBookmarks.map(bookmark => (
                  <BookmarkCard
                    key={bookmark.id}
                    bookmark={bookmark}
                    onOpen={handleOpen}
                    onDelete={handleDelete}
                    onToggleFavorite={handleToggleFavorite}
                    isGrid
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredBookmarks.map(bookmark => (
                  <BookmarkCard
                    key={bookmark.id}
                    bookmark={bookmark}
                    onOpen={handleOpen}
                    onDelete={handleDelete}
                    onToggleFavorite={handleToggleFavorite}
                    isGrid={false}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
