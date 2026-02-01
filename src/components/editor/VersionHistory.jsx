'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { History, RotateCcw, X, ChevronDown, ChevronUp, Eye } from 'lucide-react';

export function VersionHistory({ noteId, isOpen, onClose, onRestore }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedVersion, setExpandedVersion] = useState(null);
  const [restoring, setRestoring] = useState(null);

  useEffect(() => {
    if (isOpen && noteId) {
      fetchVersions();
    }
  }, [isOpen, noteId]);

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/notes/${noteId}/versions`);
      const data = await response.json();
      if (data.success) {
        setVersions(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (version) => {
    setRestoring(version.id);
    try {
      const response = await fetch(`/api/notes/${noteId}/versions/${version.id}`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        onRestore(version);
        onClose();
      }
    } catch (error) {
      console.error('Failed to restore version:', error);
    } finally {
      setRestoring(null);
    }
  };

  const toggleExpand = (versionId) => {
    setExpandedVersion(expandedVersion === versionId ? null : versionId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-2xl max-h-[80vh] bg-zinc-900 border border-zinc-700/50 rounded-lg shadow-2xl overflow-hidden"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-700/50 bg-zinc-800">
          <div className="flex items-center gap-2 text-zinc-100">
            <History className="w-5 h-5 text-purple-500" />
            <span className="font-bold">VERSION HISTORY</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-950 rounded transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-pulse text-zinc-400">
                Loading versions...
              </div>
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-12 text-zinc-400">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No version history yet</p>
              <p className="text-sm mt-2 opacity-75">
                Versions are created when you save significant changes
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className="border border-zinc-700/50 rounded-lg overflow-hidden bg-zinc-950"
                >
                  {/* Version Header */}
                  <div 
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-zinc-800 transition-colors"
                    onClick={() => toggleExpand(version.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs px-2 py-1 bg-purple-600 text-white rounded font-mono">
                        v{version.version_number}
                      </span>
                      <div>
                        <p className="text-sm text-zinc-100 font-medium">
                          {version.title}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {index !== 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestore(version);
                          }}
                          disabled={restoring === version.id}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-purple-600 text-white rounded hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          <RotateCcw className="w-3 h-3" />
                          {restoring === version.id ? 'Restoring...' : 'Restore'}
                        </button>
                      )}
                      {expandedVersion === version.id ? (
                        <ChevronUp className="w-4 h-4 text-zinc-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-zinc-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Content Preview */}
                  {expandedVersion === version.id && (
                    <div className="border-t border-zinc-700/50 p-4 bg-zinc-800">
                      <div className="flex items-center gap-2 mb-2 text-xs text-zinc-400">
                        <Eye className="w-3 h-3" />
                        Content Preview
                      </div>
                      <pre className="text-sm text-zinc-100 whitespace-pre-wrap font-mono bg-zinc-950 p-3 rounded border border-zinc-700/50 max-h-48 overflow-y-auto">
                        {version.content.slice(0, 500)}
                        {version.content.length > 500 && '...'}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
