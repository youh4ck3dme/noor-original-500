import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockSendMessage,
  mockStartChat,
  mockGetGenerativeModel,
  mockGoogleGenerativeAI,
} = vi.hoisted(() => {
  const sendMessage = vi.fn();
  const startChat = vi.fn(() => ({ sendMessage }));
  const getGenerativeModel = vi.fn(() => ({ startChat }));
  const GoogleGenerativeAI = vi.fn(() => ({ getGenerativeModel }));

  return {
    mockSendMessage: sendMessage,
    mockStartChat: startChat,
    mockGetGenerativeModel: getGenerativeModel,
    mockGoogleGenerativeAI: GoogleGenerativeAI,
  };
});

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: mockGoogleGenerativeAI,
}));

const FALLBACK_MESSAGE =
  'Ospravedlňujem sa, asistent je dočasne nedostupný. Skúste to, prosím, o chvíľu alebo nás kontaktujte priamo.';

const sampleMessages = [{ role: 'user' as const, content: 'Ahoj, potrebujem radu.' }];

function mistralResponse(text: string, status = 200) {
  return new Response(
    JSON.stringify({ choices: [{ message: { content: text } }] }),
    { status, headers: { 'content-type': 'application/json' } },
  );
}

describe('generateChatReply', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    mockSendMessage.mockReset();
    mockStartChat.mockReset();
    mockGetGenerativeModel.mockReset();
    mockGoogleGenerativeAI.mockReset();
    mockGoogleGenerativeAI.mockImplementation(() => ({
      getGenerativeModel: mockGetGenerativeModel,
    }));
    mockGetGenerativeModel.mockImplementation(() => ({ startChat: mockStartChat }));
    mockStartChat.mockImplementation(() => ({ sendMessage: mockSendMessage }));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('returns Gemini reply when Gemini succeeds', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'gemini-key');
    mockSendMessage.mockResolvedValue({
      response: { text: () => '  Gemini odpoveď  ' },
    });

    const { generateChatReply } = await import('./providers');
    const result = await generateChatReply(sampleMessages);

    expect(result.message).toBe('Gemini odpoveď');
    expect(result.llm_meta.provider_used).toBe('gemini');
    expect(result.llm_meta.provider_attempted).toEqual(['gemini']);
    expect(mockGoogleGenerativeAI).toHaveBeenCalledWith('gemini-key');
  });

  it('falls back to Mistral when Gemini API key is missing', async () => {
    vi.stubEnv('MISTRAL_API_KEY', 'mistral-key');
    vi.stubGlobal('fetch', vi.fn(async () => mistralResponse('Mistral odpoveď')));

    const { generateChatReply } = await import('./providers');
    const result = await generateChatReply(sampleMessages);

    expect(result.message).toBe('Mistral odpoveď');
    expect(result.llm_meta.provider_used).toBe('mistral');
    expect(result.llm_meta.fallback_reason).toBe('missing_api_key');
    expect(result.llm_meta.provider_attempted).toEqual(['gemini', 'mistral']);
  });

  it('falls back to Mistral when Gemini hits rate limit', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'gemini-key');
    vi.stubEnv('MISTRAL_API_KEY', 'mistral-key');
    mockSendMessage.mockRejectedValue(new Error('429 quota exceeded'));
    vi.stubGlobal('fetch', vi.fn(async () => mistralResponse('Mistral po limite')));

    const { generateChatReply } = await import('./providers');
    const result = await generateChatReply(sampleMessages);

    expect(result.message).toBe('Mistral po limite');
    expect(result.llm_meta.provider_used).toBe('mistral');
    expect(result.llm_meta.fallback_reason).toBe('rate_limit');
  });

  it('falls back to Mistral when Gemini returns empty text', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'gemini-key');
    vi.stubEnv('MISTRAL_API_KEY', 'mistral-key');
    mockSendMessage.mockResolvedValue({
      response: { text: () => '   ' },
    });
    vi.stubGlobal('fetch', vi.fn(async () => mistralResponse('Mistral po prázdnom Gemini')));

    const { generateChatReply } = await import('./providers');
    const result = await generateChatReply(sampleMessages);

    expect(result.message).toBe('Mistral po prázdnom Gemini');
    expect(result.llm_meta.fallback_reason).toBe('empty_response');
  });

  it('tries Mistral backup key when the first key fails', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'gemini-key');
    vi.stubEnv('MISTRAL_API_KEY', 'bad-key good-key');
    mockSendMessage.mockRejectedValue(new Error('429 quota exceeded'));
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('rate limited', { status: 429 }))
      .mockResolvedValueOnce(mistralResponse('Odpoveď z backup kľúča'));
    vi.stubGlobal('fetch', fetchMock);

    const { generateChatReply } = await import('./providers');
    const result = await generateChatReply(sampleMessages);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.message).toBe('Odpoveď z backup kľúča');
    expect(result.llm_meta.provider_used).toBe('mistral');
  });

  it('returns static fallback when both providers fail', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'gemini-key');
    vi.stubEnv('MISTRAL_API_KEY', 'mistral-key');
    mockSendMessage.mockRejectedValue(new Error('upstream unavailable'));
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('error', { status: 500 })),
    );

    const { generateChatReply } = await import('./providers');
    const result = await generateChatReply(sampleMessages);

    expect(result.message).toBe(FALLBACK_MESSAGE);
    expect(result.llm_meta.provider_used).toBeNull();
    expect(result.llm_meta.provider_attempted).toEqual(['gemini', 'mistral']);
  });

  it('uses Mistral workflow when enabled and worker responds', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'gemini-key');
    vi.stubEnv('MISTRAL_API_KEY', 'mistral-key');
    vi.stubEnv('MISTRAL_USE_WORKFLOW', '1');
    vi.stubEnv('MISTRAL_WORKFLOW_IDENTIFIER', 'noor-pharmacist-chat');
    mockSendMessage.mockRejectedValue(new Error('429 quota exceeded'));

    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes('/workflows/noor-pharmacist-chat/execute')) {
        return new Response(JSON.stringify({ result: 'Workflow farmaceut odpoveď' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      }
      throw new Error(`Unexpected fetch URL: ${url}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    const { generateChatReply } = await import('./providers');
    const result = await generateChatReply(sampleMessages);

    expect(result.message).toBe('Workflow farmaceut odpoveď');
    expect(result.llm_meta.provider_used).toBe('mistral');
    expect(result.llm_meta.provider_mode).toBe('workflow');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('falls back to chat completions when workflow is enabled but fails', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'gemini-key');
    vi.stubEnv('MISTRAL_API_KEY', 'mistral-key');
    vi.stubEnv('MISTRAL_USE_WORKFLOW', '1');
    mockSendMessage.mockRejectedValue(new Error('429 quota exceeded'));

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('worker down', { status: 503 }))
      .mockResolvedValueOnce(mistralResponse('Completions fallback odpoveď'));
    vi.stubGlobal('fetch', fetchMock);

    const { generateChatReply } = await import('./providers');
    const result = await generateChatReply(sampleMessages);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.message).toBe('Completions fallback odpoveď');
    expect(result.llm_meta.provider_mode).toBe('completions');
  });

  it('does not call Mistral when Gemini succeeds', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'gemini-key');
    vi.stubEnv('MISTRAL_API_KEY', 'mistral-key');
    mockSendMessage.mockResolvedValue({
      response: { text: () => 'Len Gemini' },
    });
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const { generateChatReply } = await import('./providers');
    await generateChatReply(sampleMessages);

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
