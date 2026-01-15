import { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, X, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'system';
  content: string;
  timestamp: Date;
}

export const Terminal = () => {
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: '1', type: 'system', content: '🚀 OMNIVERSAL TERMINAL v2.0 - Unlimited Power', timestamp: new Date() },
    { id: '2', type: 'system', content: 'Type "help" for available commands', timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const commands: Record<string, (args: string[]) => string> = {
    help: () => `Available commands:
  help          - Show this help message
  clear         - Clear terminal
  echo <text>   - Echo text
  date          - Show current date/time
  whoami        - Show current user
  pwd           - Print working directory
  ls            - List files
  cat <file>    - Show file contents
  npm <cmd>     - Run npm commands
  git <cmd>     - Run git commands
  node <file>   - Run Node.js file
  python <file> - Run Python file
  curl <url>    - Make HTTP request
  env           - Show environment variables
  version       - Show version info`,
    clear: () => '__CLEAR__',
    echo: (args) => args.join(' '),
    date: () => new Date().toString(),
    whoami: () => 'omniversal-user@codespace',
    pwd: () => '/home/omniversal/workspace',
    ls: () => `src/
node_modules/
package.json
tsconfig.json
vite.config.ts
index.html
README.md`,
    cat: (args) => args[0] ? `// Contents of ${args[0]}\nconsole.log('Hello from ${args[0]}');` : 'Usage: cat <filename>',
    npm: (args) => {
      const cmd = args[0];
      if (cmd === 'install' || cmd === 'i') return `Installing packages...\n✓ Packages installed successfully`;
      if (cmd === 'run') return `Running ${args[1] || 'dev'}...\n✓ Server started on http://localhost:5173`;
      if (cmd === 'test') return `Running tests...\n✓ All tests passed`;
      return `npm ${args.join(' ')} - Command executed`;
    },
    git: (args) => {
      const cmd = args[0];
      if (cmd === 'status') return `On branch main\nYour branch is up to date with 'origin/main'.\nnothing to commit, working tree clean`;
      if (cmd === 'log') return `commit abc123 (HEAD -> main)\nAuthor: omniversal-user\nDate: ${new Date().toDateString()}\n\n    Latest changes`;
      if (cmd === 'branch') return `* main\n  develop\n  feature/new-feature`;
      return `git ${args.join(' ')} - Executed`;
    },
    node: (args) => args[0] ? `Running ${args[0]}...\nHello, World!\nProcess exited with code 0` : 'Usage: node <filename>',
    python: (args) => args[0] ? `Python 3.11.0\nRunning ${args[0]}...\nHello, World!` : 'Usage: python <filename>',
    curl: (args) => args[0] ? `{"status": "ok", "url": "${args[0]}"}` : 'Usage: curl <url>',
    env: () => `NODE_ENV=development\nPATH=/usr/local/bin\nHOME=/home/omniversal\nSHELL=/bin/bash`,
    version: () => `Omniversal Codespace v2.0.0\nNode.js v20.0.0\nnpm v10.0.0\nGit v2.42.0`,
  };

  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const parts = trimmed.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    setLines(prev => [...prev, {
      id: Date.now().toString(),
      type: 'input',
      content: `$ ${trimmed}`,
      timestamp: new Date(),
    }]);

    setHistory(prev => [...prev, trimmed]);
    setHistoryIndex(-1);

    setTimeout(() => {
      if (commands[command]) {
        const result = commands[command](args);
        if (result === '__CLEAR__') {
          setLines([{ id: Date.now().toString(), type: 'system', content: 'Terminal cleared', timestamp: new Date() }]);
        } else {
          setLines(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            type: 'output',
            content: result,
            timestamp: new Date(),
          }]);
        }
      } else {
        setLines(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          type: 'error',
          content: `Command not found: ${command}. Type "help" for available commands.`,
          timestamp: new Date(),
        }]);
      }
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex] || '');
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className={`flex flex-col bg-black/90 border-t border-border ${isMaximized ? 'fixed inset-0 z-50' : 'h-48'}`}>
      <div className="flex items-center justify-between px-3 py-1 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-3 w-3 text-primary" />
          <span className="text-xs font-mono text-primary">TERMINAL</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0"
            onClick={() => setIsMaximized(!isMaximized)}
          >
            {isMaximized ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-2" ref={scrollRef}>
        <div className="font-mono text-xs space-y-1">
          {lines.map((line) => (
            <div
              key={line.id}
              className={`whitespace-pre-wrap ${
                line.type === 'input' ? 'text-cyan-400' :
                line.type === 'error' ? 'text-red-400' :
                line.type === 'system' ? 'text-yellow-400' :
                'text-green-400'
              }`}
            >
              {line.content}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="flex items-center gap-2 px-2 py-1 border-t border-border/50">
        <span className="text-cyan-400 font-mono text-xs">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-green-400 font-mono text-xs outline-none"
          placeholder="Enter command..."
          autoFocus
        />
      </div>
    </div>
  );
};
