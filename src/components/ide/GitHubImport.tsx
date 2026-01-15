import { useState } from 'react';
import { Github, Upload, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { FileNode } from '@/types/ide';

interface GitHubImportProps {
  onImport?: (files: FileNode[]) => void;
}

export const GitHubImport = ({ onImport }: GitHubImportProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleImport = async () => {
    if (!githubUrl.trim()) return;
    
    setIsLoading(true);
    try {
      // Extract owner and repo from URL
      const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) {
        toast.error('Invalid GitHub URL');
        return;
      }

      const [, owner, repo] = match;
      const repoName = repo.replace('.git', '');

      // Fetch repo contents via GitHub API
      const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents`);
      
      if (!response.ok) {
        toast.error('Failed to fetch repository');
        return;
      }

      const files = await response.json();
      
      // Convert GitHub files to FileNode format
      const importedFiles: FileNode[] = files
        .filter((f: any) => f.type === 'file')
        .map((f: any) => ({
          id: `github-${f.sha}`,
          name: f.name,
          type: 'file' as const,
          content: `// Imported from ${owner}/${repoName}\n// File: ${f.path}\n// Loading content...`,
        }));

      if (onImport && importedFiles.length > 0) {
        onImport(importedFiles);
      }
      
      toast.success(`Imported ${importedFiles.length} files from ${owner}/${repoName}`);
      setIsOpen(false);
      setGithubUrl('');
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import from GitHub');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    toast('GitHub export: Connect your GitHub account in project settings for full integration');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Github className="h-4 w-4" />
          GitHub
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-primary flex items-center gap-2">
            <Github className="h-5 w-5" />
            GitHub Integration
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Import from Repository</label>
            <div className="flex gap-2">
              <Input
                placeholder="https://github.com/owner/repo"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="bg-background/50"
              />
              <Button onClick={handleImport} disabled={isLoading} size="sm">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <Button onClick={handleExport} variant="secondary" className="w-full gap-2">
              <Upload className="h-4 w-4" />
              Export to GitHub
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Full GitHub OAuth integration requires backend setup. This is a simplified version.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
