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
          className="rounded-2xl shadow-2xl w-full max-w-4xl pointer-events-auto modal-in max-h-[85vh] overflow-hidden flex flex-col"
          style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">📜</span>
              <div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  Version History
                </h2>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {versions.length} versions saved
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCompareMode(!compareMode)}
                className="px-3 py-1.5 text-sm rounded-lg transition-all"
                style={compareMode
                  ? { backgroundColor: 'var(--color-accent)', color: '#fff' }
                  : { backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-muted)' }
                }
              >
                Compare
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-all"
                style={{ color: 'var(--color-text-muted)' }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Versions List */}
            <div className="w-64 overflow-y-auto" style={{ borderRight: '1px solid var(--color-border)' }}>
              {isLoading ? (
                <div className="p-4 text-center" style={{ color: 'var(--color-text-muted)' }}>
                  Loading...
                </div>
              ) : versions.length > 0 ? (
                <div className="p-2 space-y-1">
                  {versions.map((version, index) => (
                    <button
                      key={version.id}
                      onClick={() => setSelectedVersion(version)}
                      className="w-full text-left p-3 rounded-lg transition-all"
                      style={selectedVersion?.id === version.id
                        ? { backgroundColor: 'color-mix(in srgb, var(--color-accent) 15%, transparent)', borderLeft: '2px solid var(--color-accent)' }
                        : {}
                      }
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 text-xs rounded" style={index === 0 
                          ? { backgroundColor: 'rgba(34,197,94,0.2)', color: '#4ade80' } 
                          : { backgroundColor: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)' }
                        }>
                          v{version.version_number}
                        </span>
                        {index === 0 && (
                          <span className="text-xs" style={{ color: '#4ade80' }}>Latest</span>
                        )}
                      </div>
                      <p className="text-sm mt-1 truncate" style={{ color: 'var(--color-text-primary)' }}>
                        {version.title || 'Untitled'}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                        {formatDate(version.created_at, 'relative')}
                      </p>
                      <div className="flex gap-2 mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        <span>{version.word_count} words</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center" style={{ color: 'var(--color-text-muted)' }}>
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
                      <h3 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {selectedVersion.title || 'Untitled'}
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        Version {selectedVersion.version_number} • {formatDate(selectedVersion.created_at, 'long')}
                      </p>
                    </div>
                    <button
                      onClick={handleRestore}
                      className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all text-sm font-medium"
                      style={{ backgroundColor: 'var(--color-accent)' }}
                    >
                      Restore This Version
                    </button>
                  </div>
                  
                  <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)' }}>
                    <pre className="whitespace-pre-wrap text-sm font-mono" style={{ color: 'var(--color-text-primary)' }}>
                      {selectedVersion.content}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center" style={{ color: 'var(--color-text-muted)' }}>
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
