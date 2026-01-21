'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Send, X, Loader2, Sparkles, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am XAND Bot. Ask me anything about the Xandeum Network nodes.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage].filter(m => m.role !== 'system') })
      });

      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
        <Card 
          className="w-full h-full shadow-md border flex flex-col gap-0 py-0 overflow-hidden font-chat"
        >
          <CardHeader className="bg-muted/50 p-4 border flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <img src="/xandeum.png" alt="XAND" className="w-7 h-7" />
              <CardTitle className="text-xl font-semibold">XAND Assistant</CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full p-4">
              <div className="flex flex-col gap-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-start gap-2 max-w-[80%]",
                      msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      {msg.role === 'assistant' ? (
                        <AvatarImage src="/xandeum.png" alt="XAND" />
                      ) : (
                        <AvatarFallback className="bg-muted">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      )}
                    </Avatar>

                    <div
                      className={cn(
                        "rounded-lg px-3 py-2 text-sm",
                        msg.role === 'user' 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted text-foreground prose dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0"
                      )}
                    >
                      {msg.role === 'assistant' ? (
                        <ReactMarkdown 
                          components={{
                            p: ({...props}) => <p className="mb-2 last:mb-0" {...props} />,
                            ul: ({...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
                            ol: ({...props}) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                            li: ({...props}) => <li className="mb-1" {...props} />,
                            pre: ({...props}) => <pre className="bg-muted-foreground/20 p-2 rounded mb-2 overflow-x-auto" {...props} />,
                            code: ({...props}) => <code className="bg-muted-foreground/20 px-1 py-0.5 rounded text-xs font-mono" {...props} />,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                   <div className="flex items-start gap-2 max-w-[80%] mr-auto">
                    <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src="/xandeum.png"/>
                    </Avatar>
                    <div className="bg-muted rounded-lg px-3 py-2 flex items-center">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    </div>
                   </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="p-3 border-t bg-background/50 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="flex w-full mb-2 items-center gap-2">
              <Input 
                placeholder="Ask about Xandeum nodes..." 
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
  );
}
