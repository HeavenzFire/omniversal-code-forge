import { useState } from 'react';
import { Play, Code2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PreviewPanelProps {
  code: string;
  language: string;
}

export const PreviewPanel = ({ code, language }: PreviewPanelProps) => {
  const [output, setOutput] = useState('');
  const [activeTab, setActiveTab] = useState('preview');

  const runCode = () => {
    try {
      // For HTML/CSS/JS, create a preview
      if (language === 'html' || language === 'javascript' || language === 'css') {
        setOutput('Preview updated');
        setActiveTab('preview');
      } else {
        // For other languages, show a message
        setOutput('Code execution preview (simulation mode)');
        setActiveTab('output');
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setActiveTab('output');
    }
  };

  const getPreviewContent = () => {
    if (language === 'html') {
      return code;
    }
    if (language === 'javascript') {
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { 
                background: #1a1a2e; 
                color: #00fff5; 
                font-family: monospace; 
                padding: 20px; 
              }
            </style>
          </head>
          <body>
            <pre id="output"></pre>
            <script>
              const originalLog = console.log;
              console.log = function(...args) {
                document.getElementById('output').textContent += args.join(' ') + '\\n';
                originalLog.apply(console, args);
              };
              try {
                ${code}
              } catch (error) {
                document.getElementById('output').textContent = 'Error: ' + error.message;
              }
            </script>
          </body>
        </html>
      `;
    }
    return '<div style="padding: 20px; color: #00fff5;">Preview not available for this language</div>';
  };

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-primary">PREVIEW</span>
        </div>
        <Button
          size="sm"
          onClick={runCode}
          className="h-7 gap-2"
        >
          <Play className="h-3 w-3" />
          Run
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-3 mt-2 grid w-auto grid-cols-2">
          <TabsTrigger value="preview" className="gap-2">
            <Eye className="h-3 w-3" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="output" className="gap-2">
            <Code2 className="h-3 w-3" />
            Output
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="flex-1 m-0 mt-2">
          <div className="h-full p-3">
            <iframe
              srcDoc={getPreviewContent()}
              className="w-full h-full border border-border rounded bg-background"
              title="Preview"
              sandbox="allow-scripts"
            />
          </div>
        </TabsContent>

        <TabsContent value="output" className="flex-1 m-0 mt-2">
          <ScrollArea className="h-full p-3">
            <pre className="text-sm font-mono text-foreground whitespace-pre-wrap">
              {output || 'Run code to see output...'}
            </pre>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
