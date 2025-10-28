import { useState } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { AIMessage } from '@/types/ide';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIAssistantProps {
  currentCode: string;
  currentLanguage: string;
  onCodeSuggestion: (code: string) => void;
}

export const AIAssistant = ({ currentCode, currentLanguage, onCodeSuggestion }: AIAssistantProps) => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('code-assist', {
        body: {
          code: currentCode,
          language: currentLanguage,
          prompt: input,
        },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.suggestion,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling AI assistant:', error);
      toast.error('Failed to get AI assistance');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="p-3 border-b border-border flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-primary">AI ASSISTANT</span>
      </div>

      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary/50" />
            <p>Ask me anything about your code!</p>
            <p className="text-xs mt-2">I can help with:</p>
            <ul className="text-xs mt-2 space-y-1">
              <li>• Code generation</li>
              <li>• Bug fixing</li>
              <li>• Optimization</li>
              <li>• Explanations</li>
            </ul>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary/10 border border-primary/20 ml-8'
                    : 'bg-muted/50 mr-8'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-primary">
                    {message.role === 'user' ? 'YOU' : 'AI'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>AI is thinking...</span>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI for help..."
            className="min-h-[60px] max-h-[120px] bg-input"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            size="sm"
            className="h-auto"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
