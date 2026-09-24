import { FormEvent, useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { publicChatApi } from '@/api/publicChat';
import { Spinner } from '@/components/ui/Spinner';
import { classNames } from '@/utils/classNames';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  ts: number;
}

export function PublicChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, sending]);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setMessages((m) => [...m, { role: 'user', content: text, ts: Date.now() }]);
    setInput('');
    setSending(true);

    try {
      const res = await publicChatApi.message(text);
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: res.reply, ts: Date.now() },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: 'Sorry, I am having trouble. Please email support@bizos.co.ke.',
          ts: Date.now(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-brand-600 text-white shadow-lg flex items-center justify-center hover:bg-brand-700 transition"
          aria-label="Open chat"
          type="button"
        >
          <MessageCircle size={20} />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-40 w-[360px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-3rem)] bg-white border border-slate-200 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
          <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">BizOS Assistant</p>
              <p className="text-xs text-slate-400">
                Ask about features, pricing, setup
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded hover:bg-white/10"
              aria-label="Close"
              type="button"
            >
              <X size={16} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-sm text-slate-500 mt-8">
                <p className="mb-1">👋 Hi!</p>
                <p>Ask me anything about BizOS.</p>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={classNames(
                  'max-w-[85%] px-3 py-2 rounded-lg text-sm whitespace-pre-wrap',
                  m.role === 'user'
                    ? 'ml-auto bg-brand-600 text-white'
                    : 'bg-slate-100 text-slate-800'
                )}
              >
                {m.content}
              </div>
            ))}

            {sending && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Spinner size="sm" /> Thinking…
              </div>
            )}
          </div>

          <form
            onSubmit={send}
            className="border-t border-slate-200 p-3 flex items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="p-2 rounded-md bg-brand-600 text-white disabled:opacity-50 hover:bg-brand-700 transition"
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}