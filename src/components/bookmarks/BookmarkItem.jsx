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
      <div className="group rounded-xl border overflow-hidden transition-all" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)' }}>
        {/* Preview Image */}
        {bookmark.preview_image_url ? (
          <div 
            className="h-32 bg-cover bg-center cursor-pointer"
            style={{ backgroundImage: `url(${bookmark.preview_image_url})` }}
            onClick={() => onClick(bookmark)}
          />
        ) : (
          <div 
            className="h-32 flex items-center justify-center cursor-pointer"
            style={{ backgroundColor: 'var(--color-bg-secondary)' }}
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
                className="font-medium truncate cursor-pointer transition-colors"
                style={{ color: 'var(--color-text-primary)' }}
                onClick={() => onClick(bookmark)}
              >
                {bookmark.title}
              </h3>
              <p className="text-xs truncate" style={{ color: 'var(--color-text-tertiary)' }}>
                {hostname}
              </p>
            </div>
          </div>

          {/* Description */}
          {bookmark.description && (
            <p className="text-sm mt-2 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
              {bookmark.description}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {bookmark.category && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 20%, transparent)', color: 'var(--color-accent)' }}>
                {bookmark.category}
              </span>
            )}
            {bookmark.click_count > 0 && (
              <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                👁 {bookmark.click_count}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="p-1.5 rounded-lg transition-all"
              style={{ color: 'var(--color-text-tertiary)' }}
              title="Edit"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(bookmark.id)}
              className="p-1.5 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              style={{ color: 'var(--color-text-tertiary)' }}
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
    <div className="group flex items-center gap-4 p-4 rounded-xl border transition-all" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)' }}>
      {/* Favicon */}
      <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
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
            className="font-medium truncate cursor-pointer transition-colors"
            style={{ color: 'var(--color-text-primary)' }}
            onClick={() => onClick(bookmark)}
          >
            {bookmark.title}
          </h3>
          {bookmark.click_count > 0 && (
            <span className="text-xs flex-shrink-0" style={{ color: 'var(--color-text-tertiary)' }}>
              👁 {bookmark.click_count}
            </span>
          )}
        </div>
        
        <p className="text-sm truncate" style={{ color: 'var(--color-text-tertiary)' }}>
          {hostname}
        </p>

        {/* Tags & Category */}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {bookmark.category && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 20%, transparent)', color: 'var(--color-accent)' }}>
              {bookmark.category}
            </span>
          )}
          {bookmark.tags?.map(tag => (
            <span 
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}
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
          className="p-2 rounded-lg transition-all"
          style={{ color: 'var(--color-text-tertiary)' }}
          title="Open link"
        >
          🔗
        </button>
        <button
          onClick={onEdit}
          className="p-2 rounded-lg transition-all"
          style={{ color: 'var(--color-text-tertiary)' }}
          title="Edit"
        >
          ✏️
        </button>
        <button
          onClick={() => onDelete(bookmark.id)}
          className="p-2 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
          style={{ color: 'var(--color-text-tertiary)' }}
          title="Delete"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
