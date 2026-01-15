import { useState } from 'react';
import { 
  PanelLeftClose, PanelLeftOpen, Play, Settings, Download, 
  Share2, Moon, Sun, Boxes, Terminal as TerminalIcon,
  ChevronDown, Zap, Sparkles, Code2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileExplorer } from '@/components/ide/FileExplorer';
import { CodeEditor } from '@/components/ide/CodeEditor';
import { PreviewPanel } from '@/components/ide/PreviewPanel';
import { AIAssistant } from '@/components/ide/AIAssistant';
import { GitHubImport } from '@/components/ide/GitHubImport';
import { Terminal } from '@/components/ide/Terminal';
import { LanguageSelector } from '@/components/ide/LanguageSelector';
import { IntegrationsPanel } from '@/components/ide/IntegrationsPanel';
import { SettingsPanel } from '@/components/ide/SettingsPanel';
import type { FileNode, EditorTab } from '@/types/ide';
import { toast } from 'sonner';

const defaultFiles: FileNode[] = [
  {
    id: '1',
    name: 'src',
    type: 'folder',
    children: [
      { id: '2', name: 'App.tsx', type: 'file', language: 'typescript', content: `import React from 'react';\n\nexport default function App() {\n  return (\n    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">\n      <h1 className="text-4xl font-bold text-white p-8">\n        🚀 Welcome to Omniversal Codespace\n      </h1>\n    </div>\n  );\n}` },
      { id: '3', name: 'index.css', type: 'file', language: 'css', content: `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n:root {\n  --primary: 180 100% 50%;\n}\n\nbody {\n  font-family: 'Inter', sans-serif;\n}` },
      { id: '4', name: 'main.tsx', type: 'file', language: 'typescript', content: `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nimport './index.css';\n\nReactDOM.createRoot(document.getElementById('root')!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);` },
    ],
  },
  { id: '5', name: 'package.json', type: 'file', language: 'json', content: `{\n  "name": "omniversal-app",\n  "version": "1.0.0",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build"\n  }\n}` },
  { id: '6', name: 'README.md', type: 'file', language: 'markdown', content: `# Omniversal Codespace\n\n🚀 **The Ultimate AI-Powered IDE**\n\n## Features\n- 🧠 Unlimited AI assistance\n- 💻 40+ programming languages\n- 🔗 Full integration ecosystem\n- ⚡ Real-time preview\n- 🛠️ Built-in terminal\n\n## Getting Started\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n\nBuilt with ❤️ by Omniversal` },
];

const Index = () => {
  const [files, setFiles] = useState<FileNode[]>(defaultFiles);
  const [openTabs, setOpenTabs] = useState<EditorTab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showTerminal, setShowTerminal] = useState(true);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const activeFile = openTabs.find(tab => tab.id === activeTab);

  const handleFileSelect = (file: FileNode) => {
    if (file.type === 'folder') return;
    
    const existingTab = openTabs.find(tab => tab.id === file.id);
    if (!existingTab) {
      const newTab: EditorTab = {
        id: file.id,
        name: file.name,
        language: file.language || 'plaintext',
        content: file.content || '',
        isDirty: false,
      };
      setOpenTabs(prev => [...prev, newTab]);
    }
    setActiveTab(file.id);
  };

  const handleTabClose = (tabId: string) => {
    setOpenTabs(prev => prev.filter(tab => tab.id !== tabId));
    if (activeTab === tabId) {
      const remaining = openTabs.filter(tab => tab.id !== tabId);
      setActiveTab(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
    }
  };

  const handleCodeChange = (value: string | undefined) => {
    if (!activeTab || value === undefined) return;
    setOpenTabs(prev => prev.map(tab => 
      tab.id === activeTab ? { ...tab, content: value, isDirty: true } : tab
    ));
  };

  const handleLanguageChange = (language: string) => {
    if (!activeTab) return;
    setOpenTabs(prev => prev.map(tab =>
      tab.id === activeTab ? { ...tab, language } : tab
    ));
    toast.success(`Language changed to ${language}`);
  };

  const handleCodeSuggestion = (code: string) => {
    if (!activeTab) return;
    setOpenTabs(prev => prev.map(tab =>
      tab.id === activeTab ? { ...tab, content: code, isDirty: true } : tab
    ));
  };

  const handleImport = (importedFiles: FileNode[]) => {
    setFiles(prev => [...prev, ...importedFiles]);
  };

  const handleRun = () => {
    toast.success('Running code...');
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Top Bar */}
      <header className="h-12 border-b border-border flex items-center justify-between px-4 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Zap className="h-6 w-6 text-primary animate-pulse" />
              <div className="absolute inset-0 blur-sm bg-primary/50 -z-10" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-primary via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              OMNIVERSAL
            </span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold">
            <Sparkles className="h-3 w-3" />
            ULTIMATE
          </div>
        </div>

        <div className="flex items-center gap-2">
          <GitHubImport onImport={handleImport} />
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowIntegrations(true)}
            className="gap-2"
          >
            <Boxes className="h-4 w-4" />
            Integrations
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTerminal(!showTerminal)}
            className={showTerminal ? 'bg-primary/20' : ''}
          >
            <TerminalIcon className="h-4 w-4" />
          </Button>

          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="sm">
            <Share2 className="h-4 w-4" />
          </Button>

          <Button 
            size="sm" 
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
            onClick={handleRun}
          >
            <Play className="h-4 w-4 mr-1" />
            Run
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Sidebar */}
          <ResizablePanel 
            defaultSize={sidebarCollapsed ? 3 : 15} 
            minSize={3} 
            maxSize={25}
            collapsible
            collapsedSize={3}
            onCollapse={() => setSidebarCollapsed(true)}
            onExpand={() => setSidebarCollapsed(false)}
          >
            <div className="h-full flex flex-col bg-card/30">
              <div className="p-2 border-b border-border flex items-center justify-between">
                {!sidebarCollapsed && <span className="text-xs font-semibold text-primary">EXPLORER</span>}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                >
                  {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                </Button>
              </div>
              {!sidebarCollapsed && (
                <FileExplorer files={files} onFileSelect={handleFileSelect} />
              )}
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Editor + Terminal */}
          <ResizablePanel defaultSize={45}>
            <div className="h-full flex flex-col">
              {/* Editor Tabs */}
              <div className="flex items-center border-b border-border bg-muted/30 overflow-x-auto">
                {openTabs.map(tab => (
                  <div
                    key={tab.id}
                    className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer border-r border-border hover:bg-muted/50 transition-colors ${
                      activeTab === tab.id ? 'bg-card text-primary border-b-2 border-b-primary' : 'text-muted-foreground'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span className="truncate max-w-32">{tab.name}</span>
                    {tab.isDirty && <span className="text-primary">●</span>}
                    <button
                      className="hover:text-destructive ml-1"
                      onClick={(e) => { e.stopPropagation(); handleTabClose(tab.id); }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {activeFile && (
                  <div className="ml-auto pr-2">
                    <LanguageSelector
                      currentLanguage={activeFile.language}
                      onLanguageChange={handleLanguageChange}
                    />
                  </div>
                )}
              </div>

              {/* Code Editor */}
              <div className="flex-1 overflow-hidden">
                {activeFile ? (
                  <CodeEditor
                    value={activeFile.content}
                    language={activeFile.language}
                    onChange={handleCodeChange}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Zap className="h-16 w-16 mx-auto mb-4 text-primary/30" />
                      <p className="text-lg">Select a file to start editing</p>
                      <p className="text-sm mt-2">or use AI to generate code</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Terminal */}
              {showTerminal && <Terminal />}
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - AI + Preview */}
          <ResizablePanel defaultSize={40}>
            <Tabs defaultValue="ai" className="h-full flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b border-border bg-muted/30 p-0">
                <TabsTrigger value="ai" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Assistant
                </TabsTrigger>
                <TabsTrigger value="preview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                  <Play className="h-4 w-4 mr-2" />
                  Preview
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="ai" className="flex-1 m-0 overflow-hidden">
                <AIAssistant
                  currentCode={activeFile?.content || ''}
                  currentLanguage={activeFile?.language || 'javascript'}
                  onCodeSuggestion={handleCodeSuggestion}
                />
              </TabsContent>
              
              <TabsContent value="preview" className="flex-1 m-0 overflow-hidden">
                <PreviewPanel
                  code={activeFile?.content || ''}
                  language={activeFile?.language || 'javascript'}
                />
              </TabsContent>
            </Tabs>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Modals */}
      <IntegrationsPanel isOpen={showIntegrations} onClose={() => setShowIntegrations(false)} />
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
};

export default Index;
