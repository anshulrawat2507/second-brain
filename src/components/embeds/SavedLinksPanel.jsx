'use client';

import { useState, useMemo } from 'react';

// SVG Icons
const Icons = {
  close: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>,
  link: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>,
  copy: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>,
  external: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>,
  trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>,
  play: <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>,
  note: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>,
  globe: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>,
  sparkles: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg>,
};

// Platform Colors
const platformColors = {
  youtube: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  twitter: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20' },
  instagram: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
  reddit: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  default: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
};

// Platform Icons
const PlatformIcon = ({ platform, size = 16 }) => {
  const icons = {
    youtube: (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="#FF0000">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
    twitter: (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className="text-zinc-100">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    instagram: (
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <defs>
          <linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFDC80" />
            <stop offset="50%" stopColor="#E1306C" />
            <stop offset="100%" stopColor="#833AB4" />
          </linearGradient>
        </defs>
        <path fill="url(#ig)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
      </svg>
    ),
    reddit: (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="#FF4500">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701z"/>
      </svg>
    ),
  };
  return icons[platform] || Icons.globe;
};

// Detect platform
function detectPlatform(url) {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('reddit.com')) return 'reddit';
  return 'default';
}

// Get YouTube thumbnail
function getYouTubeThumbnail(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
  }
  return null;
}

export function SavedLinksPanel({ 
  isOpen, 
  onClose, 
  links = [], 
  onAddLink, 
  onRemoveLink,
  onOpenNote 
}) {
  const [activeTab, setActiveTab] = useState('all');
  const [newUrl, setNewUrl] = useState('');
  const [urlError, setUrlError] = useState('');

  const filteredLinks = useMemo(() => {
    if (activeTab === 'all') return links;
    return links.filter(link => detectPlatform(link.url) === activeTab);
  }, [links, activeTab]);

  const counts = useMemo(() => ({
    all: links.length,
    youtube: links.filter(l => detectPlatform(l.url) === 'youtube').length,
    twitter: links.filter(l => detectPlatform(l.url) === 'twitter').length,
    instagram: links.filter(l => detectPlatform(l.url) === 'instagram').length,
    reddit: links.filter(l => detectPlatform(l.url) === 'reddit').length,
  }), [links]);

  const handleAdd = () => {
    if (!newUrl.trim()) return;
    const platform = detectPlatform(newUrl);
    if (platform === 'default' && !newUrl.startsWith('http')) {
      setUrlError('Enter a valid URL');
      return;
    }
    onAddLink?.(newUrl);
    setNewUrl('');
    setUrlError('');
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setNewUrl(text);
        setUrlError('');
      }
    } catch (err) {
      console.error('Clipboard error');
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'youtube', label: 'YouTube' },
    { id: 'twitter', label: 'X' },
    { id: 'instagram', label: 'Instagram' },
    { id: 'reddit', label: 'Reddit' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Panel - Floating card style */}
      <div className="relative ml-auto mr-4 my-4 w-full max-w-md bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 rounded-2xl flex flex-col overflow-hidden shadow-2xl shadow-black/50 animate-in slide-in-from-right-8 duration-300">
        
        {/* Header - Minimal */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-400">
              {Icons.sparkles}
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-100">Saved Links</h2>
              <p className="text-xs text-zinc-500">{links.length} links collected</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all"
          >
            {Icons.close}
          </button>
        </div>

        {/* Add Link */}
        <div className="p-4 border-b border-zinc-800/50">
          <div className="flex gap-2">
            <input
              type="url"
              value={newUrl}
              onChange={(e) => { setNewUrl(e.target.value); setUrlError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Paste a link..."
              className="flex-1 px-4 py-2.5 bg-zinc-800/30 border border-zinc-700/30 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/40 focus:bg-zinc-800/50 transition-all"
            />
            <button
              onClick={handlePaste}
              className="p-2.5 rounded-xl bg-zinc-800/30 border border-zinc-700/30 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/30 transition-all"
              title="Paste"
            >
              {Icons.copy}
            </button>
            <button
              onClick={handleAdd}
              disabled={!newUrl.trim()}
              className="px-4 py-2.5 rounded-xl bg-purple-500 text-white text-sm font-medium hover:bg-purple-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Save
            </button>
          </div>
          {urlError && <p className="text-xs text-red-400 mt-2">{urlError}</p>}
        </div>

        {/* Tabs - Pills style */}
        <div className="flex gap-1 p-3 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/30'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
              }`}
            >
              {tab.id !== 'all' && <PlatformIcon platform={tab.id} size={12} />}
              <span>{tab.label}</span>
              {counts[tab.id] > 0 && (
                <span className={`px-1.5 rounded-full text-[10px] tabular-nums ${
                  activeTab === tab.id ? 'bg-purple-500/30' : 'bg-zinc-800'
                }`}>
                  {counts[tab.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Links List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredLinks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <div className="w-14 h-14 rounded-2xl bg-zinc-800/50 flex items-center justify-center mb-4 text-zinc-600">
                {activeTab === 'all' ? Icons.link : <PlatformIcon platform={activeTab} size={24} />}
              </div>
              <p className="text-sm text-zinc-400">No links yet</p>
              <p className="text-xs text-zinc-600 mt-1">Paste a link above to get started</p>
            </div>
          ) : (
            filteredLinks.map((link) => (
              <LinkCard 
                key={link.id} 
                link={link} 
                onRemove={onRemoveLink}
                onOpenNote={onOpenNote}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Modern Link Card
function LinkCard({ link, onRemove, onOpenNote }) {
  const platform = detectPlatform(link.url);
  const colors = platformColors[platform] || platformColors.default;
  const thumbnail = platform === 'youtube' ? getYouTubeThumbnail(link.url) : null;
  const [copied, setCopied] = useState(false);

  const copyUrl = () => {
    navigator.clipboard.writeText(link.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={`group relative p-3 rounded-xl bg-zinc-800/30 border border-zinc-700/20 hover:border-zinc-600/30 hover:bg-zinc-800/50 transition-all`}>
      <div className="flex gap-3">
        {/* Thumbnail */}
        {thumbnail ? (
          <a 
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 group/thumb bg-zinc-900"
          >
            <img src={thumbnail} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity">
              <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center">
                {Icons.play}
              </div>
            </div>
          </a>
        ) : (
          <a 
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-opacity`}
          >
            <PlatformIcon platform={platform} size={18} />
          </a>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <a 
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm font-medium text-zinc-200 hover:text-white line-clamp-1 transition-colors"
          >
            {link.title || new URL(link.url).hostname}
          </a>
          <p className="text-xs text-zinc-600 truncate mt-0.5">{link.url}</p>

          {/* Note reference */}
          {link.noteTitle && link.noteId && (
            <button
              onClick={() => onOpenNote?.(link.noteId)}
              className="flex items-center gap-1 mt-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              {Icons.note}
              <span className="truncate">{link.noteTitle}</span>
            </button>
          )}
        </div>

        {/* Actions - Show on hover */}
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={copyUrl}
            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Copy"
          >
            {copied ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
            ) : (
              Icons.copy
            )}
          </button>
          <button
            onClick={() => onRemove?.(link.id)}
            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-red-400 transition-colors"
            title="Remove"
          >
            {Icons.trash}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SavedLinksPanel;
