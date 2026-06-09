import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGenerateChatReply } = vi.hoisted(() => ({
  mockGenerateChatReply: vi.fn(),
}));

vi.mock('@/app/lib/ai/providers', () => ({
  generateChatReply: mockGenerateChatReply,
}));

const { POST } = await import('./route');

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3001/api/chat', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

describe('POST /api/chat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateChatReply.mockResolvedValue({
      message: 'Testovacia odpoveď',
      llm_meta: {
        provider_attempted: ['gemini'],
        provider_used: 'gemini',
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns 400 for invalid JSON body', async () => {
    const request = new NextRequest('http://localhost:3001/api/chat', {
      method: 'POST',
      body: 'not-json',
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error.code).toBe('invalid_chat_payload');
    expect(mockGenerateChatReply).not.toHaveBeenCalled();
  });

  it('returns 400 when messages array is empty', async () => {
    const response = await POST(makeRequest({ messages: [] }));

    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error.code).toBe('invalid_chat_payload');
  });

  it('returns 400 when message content is blank', async () => {
    const response = await POST(
      makeRequest({ messages: [{ role: 'user', content: '   ' }] }),
    );

    expect(response.status).toBe(400);
    expect(mockGenerateChatReply).not.toHaveBeenCalled();
  });

  it('returns 400 for unsupported message role', async () => {
    const response = await POST(
      makeRequest({ messages: [{ role: 'system', content: 'hello' }] }),
    );

    expect(response.status).toBe(400);
    expect(mockGenerateChatReply).not.toHaveBeenCalled();
  });

  it('returns assistant reply with suggested replies on valid payload', async () => {
    const response = await POST(
      makeRequest({
        messages: [{ role: 'user', content: '  Potrebujem radu  ' }],
        conversation_id: 'conv-123',
      }),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();

    expect(mockGenerateChatReply).toHaveBeenCalledWith(
      [{ role: 'user', content: 'Potrebujem radu' }],
      undefined,
    );
    expect(payload.message).toBe('Testovacia odpoveď');
    expect(payload.conversation_id).toBe('conv-123');
    expect(payload.suggested_replies).toEqual([
      'Odporuč mi produkt na spánok',
      'Aké máte produkty na imunitu?',
      'Ako prebieha doprava?',
    ]);
    expect(payload.llm_meta.provider_used).toBe('gemini');
  });

  it('accepts provider query parameter', async () => {
    const request = new NextRequest('http://localhost:3001/api/chat?provider=mistral', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Test' }],
      }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockGenerateChatReply).toHaveBeenCalledWith(
      [{ role: 'user', content: 'Test' }],
      'mistral',
    );
  });

  it('accepts provider via header', async () => {
    const request = new NextRequest('http://localhost:3001/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Test' }],
      }),
      headers: {
        'content-type': 'application/json',
        'x-ai-provider': 'gemini',
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockGenerateChatReply).toHaveBeenCalledWith(
      [{ role: 'user', content: 'Test' }],
      'gemini',
    );
  });
});
