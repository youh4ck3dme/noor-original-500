'use client';

import { FormEvent, useRef, useState } from 'react';
import { Loader2, MessageCircle, Send, X } from 'lucide-react';
import { clsx } from 'clsx';
import type { ChatMessage, ChatResponseBody } from '@/app/lib/ai/types';

const INITIAL_MESSAGE: ChatMessage = {
  role: 'assistant',
  content:
    'Som váš virtuálny lekárnik GrowMedica. Pomôžem s výberom produktu alebo zodpoviem otázky o doplnkoch výživy.',
};

const CONVERSATION_STORAGE_KEY = 'noor_assistant_conversation_id';

function readConversationId(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const stored = window.localStorage.getItem(CONVERSATION_STORAGE_KEY)?.trim() ?? '';
  if (stored) {
    return stored;
  }

  const generated =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `chat-${Math.random().toString(36).slice(2, 12)}`;

  window.localStorage.setItem(CONVERSATION_STORAGE_KEY, generated);
  return generated;
}

export function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([
    'Odporuč mi produkt na spánok',
    'Aké máte produkty na imunitu?',
    'Ako prebieha doprava?',
  ]);
  const conversationIdRef = useRef<string | null>(null);
  if (conversationIdRef.current === null) {
    conversationIdRef.current = readConversationId();
  }
  const conversationId = conversationIdRef.current;
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      containerRef.current?.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    });
  };

  const sendUserMessage = async (rawMessage: string) => {
    const message = rawMessage.trim();
    if (!message || isSending) return;

    setChatError(null);
    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: message }];
    setMessages(nextMessages);
    setInput('');
    setIsSending(true);
    scrollToBottom();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages,
          conversation_id: conversationId || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Chat request failed');
      }

      const payload = (await response.json()) as ChatResponseBody;
      setMessages((current) => [...current, { role: 'assistant', content: payload.message }]);
      setSuggestedReplies(payload.suggested_replies ?? []);
      setActiveProvider(payload.llm_meta?.provider_used ?? null);
      scrollToBottom();
    } catch {
      setChatError('Chat je dočasne nedostupný. Skúste to, prosím, o chvíľu.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendUserMessage(input);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gm-primary text-white shadow-lg transition hover:scale-105"
        aria-label={open ? 'Zavrieť chat' : 'Otvoriť AI chat'}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open ? (
        <div className="fixed bottom-24 right-6 z-50 flex h-[min(70vh,560px)] w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">GrowMedica AI asistent</p>
            <p className="text-xs text-slate-500">
              Gemini + Mistral fallback
              {activeProvider ? ` · ${activeProvider}` : ''}
            </p>
          </div>

          <div ref={containerRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={clsx(
                  'max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed',
                  message.role === 'assistant'
                    ? 'self-start bg-slate-100 text-slate-800'
                    : 'ml-auto bg-gm-primary text-white',
                )}
              >
                {message.content}
              </div>
            ))}

            {chatError ? <p className="text-sm text-red-600">{chatError}</p> : null}
          </div>

          {suggestedReplies.length > 0 ? (
            <div className="flex flex-wrap gap-2 border-t border-slate-100 px-4 py-2">
              {suggestedReplies.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  onClick={() => void sendUserMessage(reply)}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
                >
                  {reply}
                </button>
              ))}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-slate-100 p-3">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Napíšte správu..."
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-gm-primary"
            />
            <button
              type="submit"
              disabled={isSending || !input.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gm-primary text-white disabled:opacity-50"
              aria-label="Odoslať"
            >
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
