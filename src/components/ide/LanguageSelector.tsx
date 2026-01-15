import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Language {
  id: string;
  name: string;
  icon: string;
  extension: string;
}

const languages: Language[] = [
  // Web
  { id: 'javascript', name: 'JavaScript', icon: '🟨', extension: '.js' },
  { id: 'typescript', name: 'TypeScript', icon: '🔷', extension: '.ts' },
  { id: 'html', name: 'HTML', icon: '🧡', extension: '.html' },
  { id: 'css', name: 'CSS', icon: '💙', extension: '.css' },
  { id: 'scss', name: 'SCSS', icon: '💗', extension: '.scss' },
  { id: 'json', name: 'JSON', icon: '📦', extension: '.json' },
  { id: 'xml', name: 'XML', icon: '📄', extension: '.xml' },
  // Systems
  { id: 'python', name: 'Python', icon: '🐍', extension: '.py' },
  { id: 'java', name: 'Java', icon: '☕', extension: '.java' },
  { id: 'csharp', name: 'C#', icon: '💜', extension: '.cs' },
  { id: 'cpp', name: 'C++', icon: '⚡', extension: '.cpp' },
  { id: 'c', name: 'C', icon: '🔵', extension: '.c' },
  { id: 'rust', name: 'Rust', icon: '🦀', extension: '.rs' },
  { id: 'go', name: 'Go', icon: '🐹', extension: '.go' },
  { id: 'swift', name: 'Swift', icon: '🍎', extension: '.swift' },
  { id: 'kotlin', name: 'Kotlin', icon: '🟣', extension: '.kt' },
  // Scripting
  { id: 'ruby', name: 'Ruby', icon: '💎', extension: '.rb' },
  { id: 'php', name: 'PHP', icon: '🐘', extension: '.php' },
  { id: 'perl', name: 'Perl', icon: '🐪', extension: '.pl' },
  { id: 'lua', name: 'Lua', icon: '🌙', extension: '.lua' },
  { id: 'shell', name: 'Shell/Bash', icon: '🐚', extension: '.sh' },
  { id: 'powershell', name: 'PowerShell', icon: '⚙️', extension: '.ps1' },
  // Data & Config
  { id: 'sql', name: 'SQL', icon: '🗃️', extension: '.sql' },
  { id: 'graphql', name: 'GraphQL', icon: '◈', extension: '.graphql' },
  { id: 'yaml', name: 'YAML', icon: '📋', extension: '.yaml' },
  { id: 'toml', name: 'TOML', icon: '⚙️', extension: '.toml' },
  { id: 'markdown', name: 'Markdown', icon: '📝', extension: '.md' },
  // Functional
  { id: 'haskell', name: 'Haskell', icon: 'λ', extension: '.hs' },
  { id: 'elixir', name: 'Elixir', icon: '💧', extension: '.ex' },
  { id: 'clojure', name: 'Clojure', icon: '🔮', extension: '.clj' },
  { id: 'scala', name: 'Scala', icon: '🔴', extension: '.scala' },
  { id: 'fsharp', name: 'F#', icon: '🔷', extension: '.fs' },
  // Other
  { id: 'dart', name: 'Dart', icon: '🎯', extension: '.dart' },
  { id: 'r', name: 'R', icon: '📊', extension: '.r' },
  { id: 'julia', name: 'Julia', icon: '🟢', extension: '.jl' },
  { id: 'solidity', name: 'Solidity', icon: '💰', extension: '.sol' },
  { id: 'dockerfile', name: 'Dockerfile', icon: '🐳', extension: '' },
  { id: 'plaintext', name: 'Plain Text', icon: '📃', extension: '.txt' },
];

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
}

export const LanguageSelector = ({ currentLanguage, onLanguageChange }: LanguageSelectorProps) => {
  const current = languages.find(l => l.id === currentLanguage) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 font-mono text-xs">
          <span>{current.icon}</span>
          <span>{current.name}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 max-h-80 overflow-y-auto">
        <DropdownMenuLabel>Web Languages</DropdownMenuLabel>
        {languages.slice(0, 8).map((lang) => (
          <DropdownMenuItem
            key={lang.id}
            onClick={() => onLanguageChange(lang.id)}
            className="gap-2"
          >
            <span>{lang.icon}</span>
            <span className="flex-1">{lang.name}</span>
            {currentLanguage === lang.id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Systems Languages</DropdownMenuLabel>
        {languages.slice(8, 16).map((lang) => (
          <DropdownMenuItem
            key={lang.id}
            onClick={() => onLanguageChange(lang.id)}
            className="gap-2"
          >
            <span>{lang.icon}</span>
            <span className="flex-1">{lang.name}</span>
            {currentLanguage === lang.id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Scripting</DropdownMenuLabel>
        {languages.slice(16, 22).map((lang) => (
          <DropdownMenuItem
            key={lang.id}
            onClick={() => onLanguageChange(lang.id)}
            className="gap-2"
          >
            <span>{lang.icon}</span>
            <span className="flex-1">{lang.name}</span>
            {currentLanguage === lang.id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Data & Config</DropdownMenuLabel>
        {languages.slice(22, 27).map((lang) => (
          <DropdownMenuItem
            key={lang.id}
            onClick={() => onLanguageChange(lang.id)}
            className="gap-2"
          >
            <span>{lang.icon}</span>
            <span className="flex-1">{lang.name}</span>
            {currentLanguage === lang.id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Functional</DropdownMenuLabel>
        {languages.slice(27, 32).map((lang) => (
          <DropdownMenuItem
            key={lang.id}
            onClick={() => onLanguageChange(lang.id)}
            className="gap-2"
          >
            <span>{lang.icon}</span>
            <span className="flex-1">{lang.name}</span>
            {currentLanguage === lang.id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Other</DropdownMenuLabel>
        {languages.slice(32).map((lang) => (
          <DropdownMenuItem
            key={lang.id}
            onClick={() => onLanguageChange(lang.id)}
            className="gap-2"
          >
            <span>{lang.icon}</span>
            <span className="flex-1">{lang.name}</span>
            {currentLanguage === lang.id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
