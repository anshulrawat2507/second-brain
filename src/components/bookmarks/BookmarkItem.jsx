'use client';

import { BookmarkForm } from './BookmarkForm';

export function BookmarkItem({ 
  bookmark, 
  onClick, 
  onEdit, 
  onDelete,
  isEditing,
  onUpdate,
  onCancelEdit,
  categories,
  isGrid = false 
}) {
  const hostname = (() => {
    try {
      return new URL(bookmark.url).hostname;
    } catch {
      return bookmark.url;
    }
  })();

  if (isEditing) {
    return (
      <BookmarkForm 
        bookmark={bookmark}
        onSubmit={(data) => onUpdate(bookmark.id, data)}
        onCancel={onCancelEdit}
        categories={categories}
      />
    );
  }

  if (isGrid) {
    return (
      <div className="group bg-zinc-900/50 rounded-xl border border-zinc-700/50 overflow-hidden hover:border-purple-500/50 transition-all">
        {/* Preview Image */}
        {bookmark.preview_image_url ? (
          <div 
            className="h-32 bg-cover bg-center cursor-pointer"
            style={{ backgroundImage: `url(${bookmark.preview_image_url})` }}
            onClick={() => onClick(bookmark)}
          />
        ) : (
          <div 
            className="h-32 bg-zinc-800/50 flex items-center justify-center cursor-pointer"
            onClick={() => onClick(bookmark)}
          >
            <span className="text-4xl opacity-30">🔗</span>
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start gap-2">
            {/* Favicon */}
            {bookmark.favicon_url && (
              <img 
                src={bookmark.favicon_url} 
                alt="" 
                className="w-4 h-4 mt-1 flex-shrink-0"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
            
            {/* Title & URL */}
            <div className="flex-1 min-w-0">
              <h3 
                className="font-medium text-zinc-200 truncate cursor-pointer hover:text-purple-400 transition-colors"
                onClick={() => onClick(bookmark)}
              >
                {bookmark.title}
              </h3>
              <p className="text-xs text-zinc-500 truncate">
                {hostname}
              </p>
            </div>
          </div>

          {/* Description */}
          {bookmark.description && (
            <p className="text-sm text-zinc-400 mt-2 line-clamp-2">
              {bookmark.description}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {bookmark.category && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                {bookmark.category}
              </span>
            )}
            {bookmark.click_count > 0 && (
              <span className="text-xs text-zinc-500">
                👁 {bookmark.click_count}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-all"
              title="Edit"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(bookmark.id)}
              className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="group flex items-center gap-4 p-4 bg-zinc-900/50 rounded-xl border border-zinc-700/50 hover:border-purple-500/50 transition-all">
      {/* Favicon */}
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-zinc-800/50 flex items-center justify-center overflow-hidden">
        {bookmark.favicon_url ? (
          <img 
            src={bookmark.favicon_url} 
            alt="" 
            className="w-6 h-6"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '🔗';
            }}
          />
        ) : (
          <span>🔗</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 
            className="font-medium text-zinc-200 truncate cursor-pointer hover:text-purple-400 transition-colors"
            onClick={() => onClick(bookmark)}
          >
            {bookmark.title}
          </h3>
          {bookmark.click_count > 0 && (
            <span className="text-xs text-zinc-500 flex-shrink-0">
              👁 {bookmark.click_count}
            </span>
          )}
        </div>
        
        <p className="text-sm text-zinc-500 truncate">
          {hostname}
        </p>

        {/* Tags & Category */}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {bookmark.category && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
              {bookmark.category}
            </span>
          )}
          {bookmark.tags?.map(tag => (
            <span 
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onClick(bookmark)}
          className="p-2 text-zinc-500 hover:text-purple-400 hover:bg-zinc-800 rounded-lg transition-all"
          title="Open link"
        >
          🔗
        </button>
        <button
          onClick={onEdit}
          className="p-2 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-all"
          title="Edit"
        >
          ✏️
        </button>
        <button
          onClick={() => onDelete(bookmark.id)}
          className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
          title="Delete"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
