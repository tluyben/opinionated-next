import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  return (
    <div
      className={cn(
        'flex w-full',
        role === 'user' ? 'justify-end' : 'justify-start'
      )}
    >
      <Card
        className={cn(
          'max-w-[80%] p-4',
          role === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted',
          isStreaming && 'animate-pulse'
        )}
      >
        <div className="text-sm font-medium mb-1">
          {role === 'user' ? 'You' : role === 'assistant' ? 'AI' : 'System'}
        </div>
        <div className="whitespace-pre-wrap break-words">{content}</div>
      </Card>
    </div>
  );
}