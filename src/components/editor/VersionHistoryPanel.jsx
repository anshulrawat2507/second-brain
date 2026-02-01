'use client';

import { useState, useEffect } from 'react';
import { cn, formatDate } from '@/lib/utils';

export function VersionHistoryPanel({ noteId, isOpen, onClose, onRestore }) {
  const [versions, setVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [compareMode, setCompareMode] = useState(false);

  useEffect(() => {
    if (isOpen && noteId) {
      fetchVersions();
    }
  }, [isOpen, noteId]);

  const fetchVersions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/notes/${noteId}/versions`);
      const data = await response.json();
      if (data.success) {
        setVersions(data.data || []);
        if (data.data?.length > 0) {
          setSelectedVersion(data.data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching versions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = () => {
    if (selectedVersion) {
      onRestore(selectedVersion.content, selectedVersion.title);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 backdrop-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-zinc-900 border border-zinc-700/50 rounded-2xl shadow-2xl w-full max-w-4xl pointer-events-auto modal-in max-h-[85vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-700/50">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📜</span>
              <div>
                <h2 className="text-lg font-bold text-zinc-100">
                  Version History
                </h2>
                <p className="text-xs text-zinc-400">
                  {versions.length} versions saved
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCompareMode(!compareMode)}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-lg transition-all',
                  compareMode
                    ? 'bg-purple-600 text-white'
                    : 'bg-zinc-950 text-zinc-400 hover:text-zinc-100'
                )}
              >
                Compare
              </button>
              <button
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-purple-400 hover:bg-zinc-800 rounded-lg transition-all"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Versions List */}
            <div className="w-64 border-r border-zinc-700/50 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-zinc-400">
                  Loading...
                </div>
              ) : versions.length > 0 ? (
                <div className="p-2 space-y-1">
                  {versions.map((version, index) => (
                    <button
                      key={version.id}
                      onClick={() => setSelectedVersion(version)}
                      className={cn(
                        'w-full text-left p-3 rounded-lg transition-all',
                        selectedVersion?.id === version.id
                          ? 'bg-purple-500/15 border-l-2 border-purple-500'
                          : 'hover:bg-zinc-800'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'px-1.5 py-0.5 text-xs rounded',
                          index === 0 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-zinc-800 text-zinc-400'
                        )}>
                          v{version.version_number}
                        </span>
                        {index === 0 && (
                          <span className="text-xs text-green-400">Latest</span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-100 mt-1 truncate">
                        {version.title || 'Untitled'}
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {formatDate(version.created_at, 'relative')}
                      </p>
                      <div className="flex gap-2 mt-1 text-xs text-zinc-400">
                        <span>{version.word_count} words</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-zinc-400">
                  <p className="text-sm">No versions found</p>
                  <p className="text-xs mt-1">Versions are created automatically when you save</p>
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="flex-1 overflow-y-auto p-4">
              {selectedVersion ? (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-zinc-100">
                        {selectedVersion.title || 'Untitled'}
                      </h3>
                      <p className="text-sm text-zinc-400">
                        Version {selectedVersion.version_number} • {formatDate(selectedVersion.created_at, 'long')}
                      </p>
                    </div>
                    <button
                      onClick={handleRestore}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:opacity-90 transition-all text-sm font-medium"
                    >
                      Restore This Version
                    </button>
                  </div>
                  
                  <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-700/50">
                    <pre className="whitespace-pre-wrap text-sm text-zinc-100 font-mono">
                      {selectedVersion.content}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-400">
                  <p>Select a version to preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
