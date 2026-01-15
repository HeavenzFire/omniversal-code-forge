import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { FileNode } from '@/types/ide';

interface FileExplorerProps {
  files: FileNode[];
  onFileSelect: (file: FileNode) => void;
  onFileCreate?: (name: string, type: 'file' | 'folder') => void;
  selectedFileId?: string;
}

export const FileExplorer = ({ files, onFileSelect, onFileCreate, selectedFileId }: FileExplorerProps) => {
  // Collect all folder IDs to expand by default
  const collectFolderIds = (nodes: FileNode[]): string[] => {
    const ids: string[] = [];
    for (const node of nodes) {
      if (node.type === 'folder') {
        ids.push(node.id);
        if (node.children) {
          ids.push(...collectFolderIds(node.children));
        }
      }
    }
    return ids;
  };

  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(['root', ...collectFolderIds(files)]));
  const [creating, setCreating] = useState<{ type: 'file' | 'folder' } | null>(null);
  const [newName, setNewName] = useState('');

  // Auto-expand new folders when files change
  useEffect(() => {
    const newFolderIds = collectFolderIds(files);
    setExpanded(prev => {
      const next = new Set(prev);
      newFolderIds.forEach(id => next.add(id));
      return next;
    });
  }, [files]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCreate = () => {
    if (newName.trim() && creating && onFileCreate) {
      onFileCreate(newName.trim(), creating.type);
      setNewName('');
      setCreating(null);
    }
  };

  const renderNode = (node: FileNode, depth = 0) => {
    const isExpanded = expanded.has(node.id);
    const isSelected = node.id === selectedFileId;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-2 px-2 py-1 hover:bg-muted/50 cursor-pointer transition-colors rounded-md ${
            isSelected ? 'bg-primary/20 border-l-2 border-primary' : ''
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => {
            if (node.type === 'folder') {
              toggleExpand(node.id);
            } else {
              onFileSelect(node);
            }
          }}
        >
          {node.type === 'folder' && (
            <span className="text-primary">
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </span>
          )}
          <span className="text-primary">
            {node.type === 'folder' ? (
              isExpanded ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />
            ) : (
              <File className="h-4 w-4" />
            )}
          </span>
          <span className="text-sm text-foreground">{node.name}</span>
        </div>
        {node.type === 'folder' && isExpanded && node.children?.map(child => renderNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <span className="text-sm font-semibold text-primary">FILES</span>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setCreating({ type: 'file' })}
            className="h-6 w-6 p-0 hover:bg-primary/20"
          >
            <File className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setCreating({ type: 'folder' })}
            className="h-6 w-6 p-0 hover:bg-primary/20"
          >
            <Folder className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {files.map(node => renderNode(node))}
        
        {creating && (
          <div className="mt-2 px-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={`New ${creating.type} name`}
              className="h-8 text-sm bg-input"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') setCreating(null);
              }}
              onBlur={() => {
                if (newName.trim()) handleCreate();
                else setCreating(null);
              }}
              autoFocus
            />
          </div>
        )}
      </div>
    </div>
  );
};
