import { NextRequest, NextResponse } from 'next/server';
import { generateChatReply, type AiProvider } from '@/app/lib/ai/providers';
import { DEFAULT_SUGGESTED_REPLIES } from '@/app/lib/ai/persona';
import type { ChatMessage, ChatRequestBody, ChatResponseBody } from '@/app/lib/ai/types';

function isValidMessages(messages: unknown): messages is ChatMessage[] {
  if (!Array.isArray(messages) || messages.length === 0) return false;
  return messages.every(
    (item) =>
      item &&
      typeof item === 'object' &&
      (item.role === 'user' || item.role === 'assistant') &&
      typeof item.content === 'string' &&
      item.content.trim().length > 0,
  );
}

/**
 * Determine which AI provider to use based on:
 * 1. Query param: ?provider=gemini|mistral|mistral-workflow|auto
 * 2. Header: x-ai-provider
 * 3. Random A/B assignment (50/50 between gemini and mistral) if enabled
 */
function getProviderForRequest(request: NextRequest): AiProvider | undefined {
  // Check query param first
  const url = new URL(request.url);
  const queryProvider = url.searchParams.get('provider') as AiProvider | null;
  if (queryProvider && ['gemini', 'mistral', 'mistral-workflow', 'auto'].includes(queryProvider)) {
    return queryProvider === 'auto' ? undefined : queryProvider;
  }

  // Check header
  const headerProvider = request.headers.get('x-ai-provider') as AiProvider | null;
  if (headerProvider && ['gemini', 'mistral', 'mistral-workflow', 'auto'].includes(headerProvider)) {
    return headerProvider === 'auto' ? undefined : headerProvider;
  }

  // A/B testing: random assignment if enabled
  const abTesting = process.env.AI_AB_TESTING === '1';
  if (abTesting) {
    const providers: AiProvider[] = ['gemini', 'mistral'];
    const randomIndex = Math.floor(Math.random() * providers.length);
    return providers[randomIndex];
  }

  // Default: auto (let generateChatReply decide)
  return undefined;
}

/**
 * Log A/B test assignment for analytics
 */
function logAbAssignment(provider: AiProvider | undefined, request: NextRequest) {
  const abLogging = process.env.AI_AB_LOGGING === '1';
  if (!abLogging) return;

  const url = new URL(request.url);
  const sessionId = url.searchParams.get('session_id') || request.headers.get('x-session-id') || 'unknown';

  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    event: 'ab_assignment',
    session_id: sessionId,
    assigned_provider: provider || 'auto',
    user_agent: request.headers.get('user-agent'),
    path: url.pathname,
  }));
}

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => null)) as ChatRequestBody | null;

  if (!payload || !isValidMessages(payload.messages)) {
    return NextResponse.json(
      { error: { code: 'invalid_chat_payload', message: 'Invalid chat payload.' } },
      { status: 400 },
    );
  }

  const messages = payload.messages.map((message) => ({
    role: message.role,
    content: message.content.trim(),
  }));

  // Determine provider for A/B testing
  const provider = getProviderForRequest(request);
  logAbAssignment(provider, request);

  const { message, llm_meta } = await generateChatReply(messages, provider);

  const response: ChatResponseBody = {
    message,
    conversation_id: payload.conversation_id,
    suggested_replies: DEFAULT_SUGGESTED_REPLIES,
    llm_meta,
  };

  // Add A/B test header if provider was forced
  const responseHeaders = new Headers();
  if (provider && provider !== 'auto') {
    responseHeaders.set('x-ai-provider-used', provider);
  }

  return NextResponse.json(response, { headers: responseHeaders });
}

// GET endpoint for A/B test configuration (optional)
export async function GET() {
  const abTesting = process.env.AI_AB_TESTING === '1';
  return NextResponse.json({
    ab_testing_enabled: abTesting,
    available_providers: ['gemini', 'mistral', 'mistral-workflow', 'auto'],
  });
}
