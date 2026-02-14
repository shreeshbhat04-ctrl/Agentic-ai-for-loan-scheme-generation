import { ChatMessage } from '@/data/customers';
import { cn } from '@/lib/utils';
import { User, Bot, Headphones } from 'lucide-react';
import { format } from 'date-fns';

interface ChatHistoryProps {
  messages: ChatMessage[];
  customerName?: string;
}

export const ChatHistory = ({ messages, customerName }: ChatHistoryProps) => {
  if (messages.length === 0) {
    return (
      <div className="data-card text-center py-12">
        <Headphones className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No chat history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={cn(
            'flex gap-3',
            msg.sender === 'customer' ? 'flex-row' : 'flex-row-reverse'
          )}
        >
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
            msg.sender === 'customer' && 'bg-secondary text-foreground',
            msg.sender === 'banker' && 'bg-primary text-primary-foreground',
            msg.sender === 'bot' && 'bg-accent text-accent-foreground'
          )}>
            {msg.sender === 'customer' && <User className="w-4 h-4" />}
            {msg.sender === 'banker' && <Headphones className="w-4 h-4" />}
            {msg.sender === 'bot' && <Bot className="w-4 h-4" />}
          </div>
          
          <div className={cn(
            'flex-1 max-w-[80%]',
            msg.sender !== 'customer' && 'text-right'
          )}>
            <div className={cn(
              'inline-block p-4 rounded-2xl',
              msg.sender === 'customer' && 'bg-secondary rounded-tl-none',
              msg.sender === 'banker' && 'bg-primary/20 rounded-tr-none',
              msg.sender === 'bot' && 'bg-accent/20 rounded-tr-none'
            )}>
              <p className="text-sm">{msg.message}</p>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="capitalize">{msg.sender}</span>
              <span>•</span>
              <span>{format(new Date(msg.timestamp), 'MMM d, h:mm a')}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
