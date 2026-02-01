'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useSavedLinks, detectPlatform, generateEmbedMarkdown } from '@/lib/hooks/useAutoEmbed';
import toast from 'react-hot-toast';

// Toast notification for detected embed
const EmbedToast = ({ platform, onConfirm, onDismiss }) => (
  <div className="flex items-center gap-3">
    <span>
      {platform === 'youtube' && '🎬'}
      {platform === 'twitter' && '𝕏'}
      {platform === 'instagram' && '📸'}
      {platform === 'reddit' && '🤖'}
    </span>
    <span className="text-sm">Embed {platform} link?</span>
    <button
      onClick={onConfirm}
      className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"
    >
      Yes
    </button>
    <button
      onClick={onDismiss}
      className="px-2 py-1 text-xs bg-gray-500/20 text-gray-400 rounded hover:bg-gray-500/30"
    >
      No
    </button>
  </div>
);

export function MarkdownEditor({
  content,
  onChange,
  onSave,
  readOnly = false,
  placeholder = 'Start writing your thoughts...',
  className,
  noteId,
  noteTitle,
  autoEmbed = true,
}) {
  // Use local state to handle input directly
  const [text, setText] = useState(content);
  const textareaRef = useRef(null);
  const { addLink } = useSavedLinks();

  // Sync when content prop changes (e.g., switching notes)
  useEffect(() => {
    setText(content);
  }, [content]);

  // Update both local and parent state
  const handleInput = (e) => {
    const newValue = e.target.value;
    setText(newValue);
    onChange(newValue);
  };

  // Handle paste to detect social media links
  const handlePaste = useCallback((e) => {
    if (!autoEmbed) return;
    
    const pastedText = e.clipboardData.getData('text');
    const platform = detectPlatform(pastedText);
    
    if (platform) {
      e.preventDefault();
      
      // Get cursor position
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Generate embed markdown
      const embedMarkdown = generateEmbedMarkdown(pastedText);
      
      // Insert at cursor position
      const newText = text.slice(0, start) + embedMarkdown + text.slice(end);
      setText(newText);
      onChange(newText);
      
      // Save the link
      addLink(pastedText, noteId, noteTitle);
      
      // Show toast notification
      toast.success(
        <div className="flex items-center gap-2">
          <span>
            {platform === 'youtube' && '🎬'}
            {platform === 'twitter' && '𝕏'}
            {platform === 'instagram' && '📸'}
            {platform === 'reddit' && '🤖'}
          </span>
          <span>{platform.charAt(0).toUpperCase() + platform.slice(1)} link embedded & saved!</span>
        </div>,
        { duration: 2000 }
      );
      
      // Set cursor position after embed
      setTimeout(() => {
        if (textarea) {
          const newPosition = start + embedMarkdown.length;
          textarea.selectionStart = newPosition;
          textarea.selectionEnd = newPosition;
          textarea.focus();
        }
      }, 0);
    }
  }, [text, onChange, addLink, noteId, noteTitle, autoEmbed]);

  return (
    <div className="w-full h-full min-h-[400px] relative">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleInput}
        onPaste={handlePaste}
        readOnly={readOnly}
        placeholder={placeholder}
        autoFocus
        className={cn(
          "w-full h-full min-h-[400px] p-6",
          "bg-transparent text-zinc-100",
          "font-mono text-base leading-relaxed",
          "border-none outline-none resize-none",
          "placeholder:text-zinc-500",
          "selection:bg-purple-500/30",
          className
        )}
        style={{ 
          caretColor: '#a855f7',
        }}
        onKeyDown={(e) => {
          // Only intercept Ctrl+S
          if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            onSave?.();
          }
        }}
      />
    </div>
  );
}
