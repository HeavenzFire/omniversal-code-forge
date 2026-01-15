import { useState } from 'react';
import { 
  Settings, Globe, Palette, Code, Terminal as TerminalIcon,
  Monitor, Moon, Sun, Keyboard, Save, Download, Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel = ({ isOpen, onClose }: SettingsPanelProps) => {
  const [settings, setSettings] = useState({
    // Domain settings
    customDomain: '',
    sslEnabled: true,
    
    // Editor settings
    fontSize: 14,
    tabSize: 2,
    wordWrap: true,
    minimap: true,
    lineNumbers: true,
    bracketPairs: true,
    autoSave: true,
    formatOnSave: true,
    
    // Theme
    theme: 'dark' as 'dark' | 'light' | 'system',
    accentColor: 'cyan',
    
    // Terminal
    terminalFontSize: 12,
    terminalScrollback: 1000,
    
    // AI
    aiModel: 'gemini-2.5-pro',
    aiTemperature: 0.4,
    aiMaxTokens: 8000,
  });

  const handleSave = () => {
    localStorage.setItem('omniversal-settings', JSON.stringify(settings));
    toast.success('Settings saved successfully!');
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'omniversal-settings.json';
    a.click();
    toast.success('Settings exported!');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        const imported = JSON.parse(text);
        setSettings(prev => ({ ...prev, ...imported }));
        toast.success('Settings imported!');
      }
    };
    input.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-lg font-bold">Settings & Configuration</h2>
              <p className="text-sm text-muted-foreground">Customize your IDE experience</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>

        <Tabs defaultValue="domain" className="flex-1 flex flex-col">
          <TabsList className="mx-4 mt-4 w-fit">
            <TabsTrigger value="domain">
              <Globe className="h-4 w-4 mr-2" />
              Domain
            </TabsTrigger>
            <TabsTrigger value="editor">
              <Code className="h-4 w-4 mr-2" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="theme">
              <Palette className="h-4 w-4 mr-2" />
              Theme
            </TabsTrigger>
            <TabsTrigger value="terminal">
              <TerminalIcon className="h-4 w-4 mr-2" />
              Terminal
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Monitor className="h-4 w-4 mr-2" />
              AI
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 p-4">
            <TabsContent value="domain" className="mt-0 space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Custom Domain</h3>
                <div className="space-y-2">
                  <Label>Domain Name</Label>
                  <Input
                    placeholder="myapp.com"
                    value={settings.customDomain}
                    onChange={(e) => setSettings(s => ({ ...s, customDomain: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Point your domain's A record to 185.158.133.1
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>SSL/HTTPS</Label>
                    <p className="text-xs text-muted-foreground">Automatic SSL certificate</p>
                  </div>
                  <Switch
                    checked={settings.sslEnabled}
                    onCheckedChange={(v) => setSettings(s => ({ ...s, sslEnabled: v }))}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="editor" className="mt-0 space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Font Size: {settings.fontSize}px</Label>
                  <Slider
                    value={[settings.fontSize]}
                    onValueChange={([v]) => setSettings(s => ({ ...s, fontSize: v }))}
                    min={10}
                    max={24}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Tab Size: {settings.tabSize}</Label>
                  <Slider
                    value={[settings.tabSize]}
                    onValueChange={([v]) => setSettings(s => ({ ...s, tabSize: v }))}
                    min={2}
                    max={8}
                    step={2}
                    className="mt-2"
                  />
                </div>
                {[
                  { key: 'wordWrap', label: 'Word Wrap', desc: 'Wrap long lines' },
                  { key: 'minimap', label: 'Minimap', desc: 'Show code minimap' },
                  { key: 'lineNumbers', label: 'Line Numbers', desc: 'Show line numbers' },
                  { key: 'bracketPairs', label: 'Bracket Pairs', desc: 'Colorize matching brackets' },
                  { key: 'autoSave', label: 'Auto Save', desc: 'Save automatically' },
                  { key: 'formatOnSave', label: 'Format on Save', desc: 'Auto-format code' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <Label>{label}</Label>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <Switch
                      checked={settings[key as keyof typeof settings] as boolean}
                      onCheckedChange={(v) => setSettings(s => ({ ...s, [key]: v }))}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="theme" className="mt-0 space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Theme Mode</Label>
                  <div className="flex gap-2 mt-2">
                    {[
                      { id: 'dark', icon: Moon, label: 'Dark' },
                      { id: 'light', icon: Sun, label: 'Light' },
                      { id: 'system', icon: Monitor, label: 'System' },
                    ].map(({ id, icon: Icon, label }) => (
                      <Button
                        key={id}
                        variant={settings.theme === id ? 'default' : 'outline'}
                        onClick={() => setSettings(s => ({ ...s, theme: id as any }))}
                        className="flex-1"
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Accent Color</Label>
                  <div className="flex gap-2 mt-2">
                    {['cyan', 'purple', 'green', 'orange', 'pink'].map(color => (
                      <button
                        key={color}
                        onClick={() => setSettings(s => ({ ...s, accentColor: color }))}
                        className={`w-8 h-8 rounded-full transition-transform ${
                          settings.accentColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                        }`}
                        style={{ backgroundColor: `var(--${color}-500, ${color})` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="terminal" className="mt-0 space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Terminal Font Size: {settings.terminalFontSize}px</Label>
                  <Slider
                    value={[settings.terminalFontSize]}
                    onValueChange={([v]) => setSettings(s => ({ ...s, terminalFontSize: v }))}
                    min={10}
                    max={20}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Scrollback Lines: {settings.terminalScrollback}</Label>
                  <Slider
                    value={[settings.terminalScrollback]}
                    onValueChange={([v]) => setSettings(s => ({ ...s, terminalScrollback: v }))}
                    min={100}
                    max={10000}
                    step={100}
                    className="mt-2"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ai" className="mt-0 space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>AI Model</Label>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {['gemini-2.5-pro', 'gemini-2.5-flash', 'gpt-5', 'gpt-5-mini'].map(model => (
                      <Button
                        key={model}
                        variant={settings.aiModel === model ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSettings(s => ({ ...s, aiModel: model }))}
                      >
                        {model}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Temperature: {settings.aiTemperature}</Label>
                  <Slider
                    value={[settings.aiTemperature]}
                    onValueChange={([v]) => setSettings(s => ({ ...s, aiTemperature: v }))}
                    min={0}
                    max={1}
                    step={0.1}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Lower = more focused, Higher = more creative
                  </p>
                </div>
                <div>
                  <Label>Max Tokens: {settings.aiMaxTokens}</Label>
                  <Slider
                    value={[settings.aiMaxTokens]}
                    onValueChange={([v]) => setSettings(s => ({ ...s, aiMaxTokens: v }))}
                    min={1000}
                    max={16000}
                    step={1000}
                    className="mt-2"
                  />
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="p-4 border-t border-border flex justify-between items-center">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={handleImport}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
