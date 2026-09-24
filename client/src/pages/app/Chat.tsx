import { FormEvent, useEffect, useRef, useState } from 'react';
import { Send, Sparkles, Trash2, MessageCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { classNames } from '@/utils/classNames';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { clientChatApi } from '@/api/chat';
import { relativeTime } from '@/utils/date';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  ts: string;
}

const SUGGESTIONS = [
  'What sold best this week?',
  'Which products are running low?',
  'How were sales today?',
  'What should I restock next?',
];

export default function Chat() {
  const { user } = useAuth();
  const { toast } = useNotifications();
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    clientChatApi
      .history(50)
      .then((items) => {
        if (!active) return;
        setMessages(
          items.map((m) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
            ts: m.ts,
          }))
        );
      })
      .catch(() => toast({ type: 'error', message: 'Could not load conversation' }))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [toast]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const optimistic: Message = {
      role: 'user',
      content: trimmed,
      ts: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput('');
    setSending(true);

    try {
      const res = await clientChatApi.message(trimmed);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.reply,
          ts: new Date().toISOString(),
        },
      ]);
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m !== optimistic));
      setInput(trimmed);
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Message failed',
      });
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const clear = async () => {
    if (!window.confirm('Delete this conversation? This cannot be undone.')) return;
    setClearing(true);
    try {
      await clientChatApi.clear();
      setMessages([]);
      toast({ type: 'success', message: 'Conversation cleared' });
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Clear failed',
      });
    } finally {
      setClearing(false);
    }
  };

  const firstName = user?.fullName?.split(' ')[0] || 'there';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <Card
        padded={false}
        className="h-[calc(100vh-8rem)] flex flex-col"
      >
        <div className="shrink-0 flex items-center justify-between gap-4 px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
              <Sparkles size={18} />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-semibold text-fg leading-none">
                AI assistant
              </h1>
              <p className="text-xs text-muted mt-1 leading-none">
                Ask about your sales, stock, and business performance
              </p>
            </div>
          </div>
          {messages.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              icon={<Trash2 size={14} />}
              loading={clearing}
              onClick={clear}
            >
              Clear
            </Button>
          )}
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin"
        >
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-14 h-14 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4">
                <MessageCircle size={26} />
              </div>
              <h2 className="text-lg font-semibold text-fg">
                Hi {firstName}, what would you like to know?
              </h2>
              <p className="text-sm text-muted mt-2 max-w-sm">
                I can see your sales, top products, low stock, and daily
                performance. Ask me anything.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-lg">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="px-3 py-1.5 rounded-full border border-border bg-surface text-xs text-fg hover:bg-elevated transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m, i) => (
                <MessageBubble key={i} message={m} />
              ))}
              {sending && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                    <Sparkles size={16} />
                  </div>
                  <div className="flex items-center gap-1 py-2">
                    <Dot delay="0ms" />
                    <Dot delay="150ms" />
                    <Dot delay="300ms" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <form
          onSubmit={onSubmit}
          className="shrink-0 border-t border-border px-4 py-3"
        >
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask about your business..."
              rows={1}
              disabled={sending}
              className={classNames(
                'flex-1 resize-none rounded-md border text-sm px-3 py-2 max-h-32',
                'bg-surface text-fg',
                'placeholder:text-muted/70',
                'focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500',
                'border-border',
                'disabled:opacity-60 disabled:cursor-not-allowed'
              )}
            />
            <Button
              type="submit"
              size="md"
              icon={<Send size={14} />}
              loading={sending}
              disabled={!input.trim()}
            >
              Send
            </Button>
          </div>
          <p className="text-[11px] text-muted mt-2">
            Enter to send · Shift+Enter for a new line
          </p>
        </form>
      </Card>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <div className={classNames('flex items-start gap-3', isUser && 'flex-row-reverse')}>
      <div
        className={classNames(
          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-semibold',
          isUser
            ? 'bg-brand-600 text-white'
            : 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400'
        )}
      >
        {isUser ? 'You' : <Sparkles size={16} />}
      </div>
      <div
        className={classNames(
          'max-w-[75%] min-w-0 rounded-lg px-4 py-2.5',
          isUser
            ? 'bg-brand-600 text-white'
            : 'bg-elevated text-fg'
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
          {message.content}
        </p>
        <p
          className={classNames(
            'text-[10px] mt-1.5',
            isUser ? 'text-white/70' : 'text-muted'
          )}
        >
          {relativeTime(message.ts)}
        </p>
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce"
      style={{ animationDelay: delay, animationDuration: '0.8s' }}
    />
  );
}