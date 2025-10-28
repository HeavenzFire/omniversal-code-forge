import { Editor } from '@monaco-editor/react';
import { Loader2 } from 'lucide-react';

interface CodeEditorProps {
  value: string;
  language: string;
  onChange: (value: string | undefined) => void;
  readOnly?: boolean;
}

export const CodeEditor = ({ value, language, onChange, readOnly = false }: CodeEditorProps) => {
  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={onChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: true,
          scrollBeyondLastLine: false,
          readOnly,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
          fontLigatures: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          contextmenu: true,
          quickSuggestions: true,
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: 'on',
          snippetSuggestions: 'top',
          bracketPairColorization: {
            enabled: true,
          },
        }}
        loading={
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      />
    </div>
  );
};
