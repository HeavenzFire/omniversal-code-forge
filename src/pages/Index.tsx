import { useState } from 'react';
import { FileExplorer } from '@/components/ide/FileExplorer';
import { CodeEditor } from '@/components/ide/CodeEditor';
import { AIAssistant } from '@/components/ide/AIAssistant';
import { PreviewPanel } from '@/components/ide/PreviewPanel';
import { GitHubImport } from '@/components/ide/GitHubImport';
import type { FileNode, EditorTab } from '@/types/ide';
import { Code2, Sparkles, Zap } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const initialFiles: FileNode[] = [
  {
    id: 'welcome',
    name: 'welcome.js',
    type: 'file',
    language: 'javascript',
    content: `// 🌟 OMNIVERSAL CODESPACE IDE 🌟
// Welcome to the most advanced web IDE
// Powered by Lovable AI - Unlimited Intelligence

console.log("Welcome to Omniversal Codespace!");
console.log("Type anything, and I'll help you build it.");

// Example: Create a quantum hello world
function quantumHello() {
  const states = ['Hello', 'Bonjour', 'Hola', 'Hallo'];
  const superposition = states[Math.floor(Math.random() * states.length)];
  return \`\${superposition}, Universe!\`;
}

console.log(quantumHello());
`,
  },
];

const Index = () => {
  const [files] = useState<FileNode[]>(initialFiles);
  const [activeFile, setActiveFile] = useState<FileNode>(initialFiles[0]);
  const [editorContent, setEditorContent] = useState(initialFiles[0].content || '');

  const handleFileSelect = (file: FileNode) => {
    if (file.type === 'file') {
      setActiveFile(file);
      setEditorContent(file.content || '');
    }
  };

  const handleFileCreate = (name: string, type: 'file' | 'folder') => {
    console.log('Creating:', type, name);
    // TODO: Implement file creation
  };

  const handleEditorChange = (value: string | undefined) => {
    setEditorContent(value || '');
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="h-14 bg-card border-b border-border flex items-center px-6 gap-4 cyber-gradient justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Code2 className="h-8 w-8 text-primary neon-glow" />
            <Sparkles className="h-3 w-3 text-secondary absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-primary">OMNIVERSAL CODESPACE</h1>
              <Badge variant="secondary" className="gap-1">
                <Zap className="h-3 w-3" />
                ULTIMATE
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Hyper-Intelligence • Web Access • Image Gen • No Limits</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <GitHubImport />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Explorer */}
        <div className="w-64 border-r border-border">
          <FileExplorer
            files={files}
            onFileSelect={handleFileSelect}
            onFileCreate={handleFileCreate}
            selectedFileId={activeFile.id}
          />
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col">
          <div className="h-10 bg-card border-b border-border flex items-center px-4 gap-2">
            <Code2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">{activeFile.name}</span>
            <span className="text-xs text-muted-foreground ml-auto">{activeFile.language}</span>
          </div>
          <div className="flex-1">
            <CodeEditor
              value={editorContent}
              language={activeFile.language || 'javascript'}
              onChange={handleEditorChange}
            />
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-96 border-l border-border">
          <Tabs defaultValue="ai" className="h-full flex flex-col">
            <TabsList className="mx-3 mt-2 grid w-auto grid-cols-2">
              <TabsTrigger value="ai" className="gap-2">
                <Sparkles className="h-3 w-3" />
                AI
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <Code2 className="h-3 w-3" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ai" className="flex-1 m-0 mt-2">
              <AIAssistant
                currentCode={editorContent}
                currentLanguage={activeFile.language || 'javascript'}
                onCodeSuggestion={(code) => setEditorContent(code)}
              />
            </TabsContent>

            <TabsContent value="preview" className="flex-1 m-0 mt-2">
              <PreviewPanel
                code={editorContent}
                language={activeFile.language || 'javascript'}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Index;
