// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AiChatWidget } from './AiChatWidget';

const CONVERSATION_STORAGE_KEY = 'noor_assistant_conversation_id';

describe('AiChatWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    window.localStorage.setItem(CONVERSATION_STORAGE_KEY, 'test-conversation');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            message: 'Odpoveď asistenta',
            suggested_replies: ['Ďalšia otázka'],
            llm_meta: { provider_used: 'gemini', provider_attempted: ['gemini'] },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
      ),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    window.localStorage.clear();
  });

  it('renders floating chat toggle button', () => {
    render(<AiChatWidget />);

    expect(screen.getByRole('button', { name: 'Otvoriť AI chat' })).toBeInTheDocument();
  });

  it('opens chat panel and sends a message', async () => {
    render(<AiChatWidget />);

    fireEvent.click(screen.getByRole('button', { name: 'Otvoriť AI chat' }));
    expect(screen.getByText('GrowMedica AI asistent')).toBeInTheDocument();

    const input = screen.getByPlaceholderText('Napíšte správu...');
    fireEvent.change(input, { target: { value: 'Ahoj' } });
    fireEvent.click(screen.getByRole('button', { name: 'Odoslať' }));

    await waitFor(() => {
      expect(screen.getByText('Odpoveď asistenta')).toBeInTheDocument();
    });

    const [, options] = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(options?.body as string) as {
      messages: Array<{ role: string; content: string }>;
      conversation_id: string;
    };

    expect(fetch).toHaveBeenCalledWith(
      '/api/chat',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(body.conversation_id).toBe('test-conversation');
    expect(body.messages).toEqual(
      expect.arrayContaining([expect.objectContaining({ role: 'user', content: 'Ahoj' })]),
    );
    expect(screen.getByText(/· gemini/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ďalšia otázka' })).toBeInTheDocument();
  });

  it('shows error message when chat API fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('fail', { status: 500 })),
    );

    render(<AiChatWidget />);
    fireEvent.click(screen.getByRole('button', { name: 'Otvoriť AI chat' }));

    const input = screen.getByPlaceholderText('Napíšte správu...');
    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.click(screen.getByRole('button', { name: 'Odoslať' }));

    await waitFor(() => {
      expect(
        screen.getByText('Chat je dočasne nedostupný. Skúste to, prosím, o chvíľu.'),
      ).toBeInTheDocument();
    });
  });
});
