import { useState } from 'react';
import { Github, Upload, Download, Loader2, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import type { FileNode } from '@/types/ide';

interface GitHubImportProps {
  onImport?: (files: FileNode[]) => void;
}

interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  type: 'file' | 'dir';
  download_url: string | null;
}

export const GitHubImport = ({ onImport }: GitHubImportProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  // Recursively fetch all files from a directory
  const fetchDirectoryContents = async (
    owner: string,
    repo: string,
    path: string = ''
  ): Promise<GitHubFile[]> => {
    const url = path
      ? `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
      : `https://api.github.com/repos/${owner}/${repo}/contents`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${path || 'root'}`);
    }

    const items: GitHubFile[] = await response.json();
    let allFiles: GitHubFile[] = [];

    for (const item of items) {
      if (item.type === 'file') {
        allFiles.push(item);
      } else if (item.type === 'dir') {
        // Recursively fetch subdirectory contents
        const subFiles = await fetchDirectoryContents(owner, repo, item.path);
        allFiles = [...allFiles, ...subFiles];
      }
    }

    return allFiles;
  };

  // Fetch actual file content
  const fetchFileContent = async (file: GitHubFile): Promise<string> => {
    if (!file.download_url) {
      return `// Could not fetch content for ${file.path}`;
    }

    try {
      const response = await fetch(file.download_url);
      if (!response.ok) {
        return `// Failed to fetch: ${file.path}`;
      }
      return await response.text();
    } catch {
      return `// Error loading: ${file.path}`;
    }
  };

  // Get language from file extension
  const getLanguageFromExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'json': 'json',
      'md': 'markdown',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'less': 'less',
      'py': 'python',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'h': 'c',
      'hpp': 'cpp',
      'sh': 'shell',
      'bash': 'shell',
      'sql': 'sql',
      'graphql': 'graphql',
      'yaml': 'yaml',
      'yml': 'yaml',
      'toml': 'toml',
      'xml': 'xml',
      'svg': 'xml',
      'vue': 'vue',
      'svelte': 'svelte',
      'php': 'php',
      'swift': 'swift',
      'kt': 'kotlin',
      'scala': 'scala',
      'lua': 'lua',
    };
    return languageMap[ext] || 'plaintext';
  };

  // Convert flat file list to nested FileNode tree
  const buildFileTree = (files: { path: string; content: string; sha: string }[]): FileNode[] => {
    const root: FileNode[] = [];
    const folderMap = new Map<string, FileNode>();

    // Sort files by path depth to ensure parents are created first
    files.sort((a, b) => a.path.split('/').length - b.path.split('/').length);

    for (const file of files) {
      const parts = file.path.split('/');
      const fileName = parts.pop()!;
      const parentPath = parts.join('/');

      const fileNode: FileNode = {
        id: `github-${file.sha}`,
        name: fileName,
        type: 'file',
        content: file.content,
        language: getLanguageFromExtension(fileName),
      };

      if (parentPath === '') {
        // File is at root level
        root.push(fileNode);
      } else {
        // Ensure parent folders exist
        let currentPath = '';
        let currentLevel = root;

        for (const part of parts) {
          currentPath = currentPath ? `${currentPath}/${part}` : part;

          if (!folderMap.has(currentPath)) {
            const folderNode: FileNode = {
              id: `folder-${currentPath}`,
              name: part,
              type: 'folder',
              children: [],
            };
            folderMap.set(currentPath, folderNode);
            currentLevel.push(folderNode);
          }

          currentLevel = folderMap.get(currentPath)!.children!;
        }

        currentLevel.push(fileNode);
      }
    }

    return root;
  };

  const handleImport = async () => {
    if (!githubUrl.trim()) return;

    setIsLoading(true);
    setProgress(0);
    setStatusMessage('Parsing repository URL...');

    try {
      // Extract owner and repo from URL
      const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) {
        toast.error('Invalid GitHub URL');
        return;
      }

      const [, owner, repo] = match;
      const repoName = repo.replace('.git', '').replace(/\/$/, '');

      // Step 1: Fetch all files recursively
      setStatusMessage('Scanning repository structure...');
      setProgress(10);

      const allFiles = await fetchDirectoryContents(owner, repoName);
      const textFiles = allFiles.filter((f) => {
        const ext = f.name.split('.').pop()?.toLowerCase();
        const textExtensions = [
          'js', 'jsx', 'ts', 'tsx', 'json', 'md', 'txt', 'html', 'css', 'scss',
          'less', 'yaml', 'yml', 'toml', 'xml', 'svg', 'py', 'rb', 'go', 'rs',
          'java', 'c', 'cpp', 'h', 'hpp', 'sh', 'bash', 'zsh', 'fish', 'sql',
          'graphql', 'prisma', 'env', 'gitignore', 'dockerfile', 'makefile',
          'vue', 'svelte', 'astro', 'php', 'swift', 'kt', 'scala', 'lua',
        ];
        return textExtensions.includes(ext || '') || !f.name.includes('.');
      });

      if (textFiles.length === 0) {
        toast.error('No text files found in repository');
        return;
      }

      setStatusMessage(`Found ${textFiles.length} files. Fetching contents...`);
      setProgress(20);

      // Step 2: Fetch content for each file with progress
      const filesWithContent: { path: string; content: string; sha: string }[] = [];
      const batchSize = 5; // Fetch 5 files at a time to avoid rate limits

      for (let i = 0; i < textFiles.length; i += batchSize) {
        const batch = textFiles.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(async (file) => ({
            path: file.path,
            sha: file.sha,
            content: await fetchFileContent(file),
          }))
        );
        filesWithContent.push(...batchResults);

        const progressPercent = 20 + ((i + batch.length) / textFiles.length) * 70;
        setProgress(progressPercent);
        setStatusMessage(`Loaded ${Math.min(i + batchSize, textFiles.length)}/${textFiles.length} files...`);
      }

      // Step 3: Build file tree
      setStatusMessage('Building file tree...');
      setProgress(95);

      const fileTree = buildFileTree(filesWithContent);

      if (onImport && fileTree.length > 0) {
        onImport(fileTree);
      }

      setProgress(100);
      toast.success(`Imported ${filesWithContent.length} files from ${owner}/${repoName}`);
      setIsOpen(false);
      setGithubUrl('');
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import from GitHub. Check if the repository is public.');
    } finally {
      setIsLoading(false);
      setProgress(0);
      setStatusMessage('');
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
            <label className="text-sm text-muted-foreground">Import from Public Repository</label>
            <div className="flex gap-2">
              <Input
                placeholder="https://github.com/owner/repo"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="bg-background/50"
                disabled={isLoading}
              />
              <Button onClick={handleImport} disabled={isLoading || !githubUrl.trim()} size="sm">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {isLoading && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
                <FolderOpen className="h-3 w-3" />
                {statusMessage}
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-border">
            <Button onClick={handleExport} variant="secondary" className="w-full gap-2" disabled={isLoading}>
              <Upload className="h-4 w-4" />
              Export to GitHub
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Imports all text files from public repositories with full content.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
