import { useState } from 'react';
import { 
  Github, Database, Cloud, Key, Globe, Zap, 
  Shield, Cpu, Boxes, CheckCircle2, AlertCircle,
  ExternalLink, Settings, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'connected' | 'disconnected' | 'pending';
  category: 'source' | 'database' | 'cloud' | 'ai' | 'security';
}

const integrations: Integration[] = [
  // Source Control
  { id: 'github', name: 'GitHub', description: 'Repository hosting & version control', icon: <Github className="h-5 w-5" />, status: 'disconnected', category: 'source' },
  { id: 'gitlab', name: 'GitLab', description: 'DevOps platform with CI/CD', icon: <Boxes className="h-5 w-5" />, status: 'disconnected', category: 'source' },
  { id: 'bitbucket', name: 'Bitbucket', description: 'Atlassian Git solution', icon: <Boxes className="h-5 w-5" />, status: 'disconnected', category: 'source' },
  
  // Databases
  { id: 'supabase', name: 'Supabase', description: 'PostgreSQL with realtime & auth', icon: <Database className="h-5 w-5" />, status: 'connected', category: 'database' },
  { id: 'mongodb', name: 'MongoDB', description: 'NoSQL document database', icon: <Database className="h-5 w-5" />, status: 'disconnected', category: 'database' },
  { id: 'planetscale', name: 'PlanetScale', description: 'Serverless MySQL platform', icon: <Database className="h-5 w-5" />, status: 'disconnected', category: 'database' },
  { id: 'redis', name: 'Redis', description: 'In-memory data store', icon: <Zap className="h-5 w-5" />, status: 'disconnected', category: 'database' },
  
  // Cloud
  { id: 'vercel', name: 'Vercel', description: 'Frontend cloud platform', icon: <Cloud className="h-5 w-5" />, status: 'disconnected', category: 'cloud' },
  { id: 'aws', name: 'AWS', description: 'Amazon Web Services', icon: <Cloud className="h-5 w-5" />, status: 'disconnected', category: 'cloud' },
  { id: 'gcp', name: 'Google Cloud', description: 'Google Cloud Platform', icon: <Cloud className="h-5 w-5" />, status: 'disconnected', category: 'cloud' },
  { id: 'azure', name: 'Azure', description: 'Microsoft Cloud', icon: <Cloud className="h-5 w-5" />, status: 'disconnected', category: 'cloud' },
  { id: 'cloudflare', name: 'Cloudflare', description: 'CDN & edge computing', icon: <Globe className="h-5 w-5" />, status: 'disconnected', category: 'cloud' },
  
  // AI
  { id: 'openai', name: 'OpenAI', description: 'GPT models & DALL-E', icon: <Cpu className="h-5 w-5" />, status: 'connected', category: 'ai' },
  { id: 'anthropic', name: 'Anthropic', description: 'Claude AI models', icon: <Cpu className="h-5 w-5" />, status: 'disconnected', category: 'ai' },
  { id: 'huggingface', name: 'Hugging Face', description: 'ML model hub', icon: <Cpu className="h-5 w-5" />, status: 'disconnected', category: 'ai' },
  { id: 'replicate', name: 'Replicate', description: 'Run ML models in cloud', icon: <Cpu className="h-5 w-5" />, status: 'disconnected', category: 'ai' },
  
  // Security
  { id: 'auth0', name: 'Auth0', description: 'Identity management', icon: <Shield className="h-5 w-5" />, status: 'disconnected', category: 'security' },
  { id: 'clerk', name: 'Clerk', description: 'User authentication', icon: <Key className="h-5 w-5" />, status: 'disconnected', category: 'security' },
  { id: 'stripe', name: 'Stripe', description: 'Payment processing', icon: <Shield className="h-5 w-5" />, status: 'disconnected', category: 'security' },
];

interface IntegrationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IntegrationsPanel = ({ isOpen, onClose }: IntegrationsPanelProps) => {
  const [localIntegrations, setLocalIntegrations] = useState(integrations);
  const [filter, setFilter] = useState<string>('all');

  const toggleIntegration = (id: string) => {
    setLocalIntegrations(prev => prev.map(int => {
      if (int.id === id) {
        const newStatus = int.status === 'connected' ? 'disconnected' : 'pending';
        if (newStatus === 'pending') {
          toast.success(`Connecting to ${int.name}...`);
          setTimeout(() => {
            setLocalIntegrations(p => p.map(i => 
              i.id === id ? { ...i, status: 'connected' as const } : i
            ));
            toast.success(`${int.name} connected successfully!`);
          }, 1500);
        } else {
          toast.info(`Disconnected from ${int.name}`);
        }
        return { ...int, status: newStatus };
      }
      return int;
    }));
  };

  const filtered = filter === 'all' 
    ? localIntegrations 
    : localIntegrations.filter(i => i.category === filter);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'source', label: 'Source Control' },
    { id: 'database', label: 'Databases' },
    { id: 'cloud', label: 'Cloud' },
    { id: 'ai', label: 'AI/ML' },
    { id: 'security', label: 'Security' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Boxes className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-lg font-bold">Integrations & Connections</h2>
              <p className="text-sm text-muted-foreground">Connect your services and APIs</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>

        <div className="flex gap-2 p-4 border-b border-border overflow-x-auto">
          {categories.map(cat => (
            <Button
              key={cat.id}
              variant={filter === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(cat.id)}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((integration) => (
              <div
                key={integration.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className={`p-2 rounded-lg ${
                  integration.status === 'connected' ? 'bg-green-500/20 text-green-500' :
                  integration.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {integration.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{integration.name}</span>
                    {integration.status === 'connected' && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                    {integration.status === 'pending' && (
                      <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{integration.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={integration.status === 'connected'}
                    onCheckedChange={() => toggleIntegration(integration.id)}
                    disabled={integration.status === 'pending'}
                  />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>{localIntegrations.filter(i => i.status === 'connected').length} connected</span>
          </div>
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>
  );
};
