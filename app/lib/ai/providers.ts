import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ChatMessage, LlmMeta } from './types';
import { PHARMACIST_PERSONA } from './persona';

type ProviderResult = { text: string; meta: Partial<LlmMeta> };

function resolveMistralApiKeys(): string[] {
  const candidates = [
    process.env.MISTRAL_API_KEY,
    process.env.MISTRAL_API_KEY_BACKUP,
  ].filter(Boolean) as string[];

  const seen = new Set<string>();
  return candidates
    .flatMap((value) => value.split(/[\s,]+/))
    .map((key) => key.trim())
    .filter((key) => key.length > 0 && !seen.has(key) && seen.add(key));
}

function isGeminiLimitError(status: number, body: string): boolean {
  if (status === 429) return true;
  if (status === 403 && /quota|rate|resource/i.test(body)) return true;
  return /RESOURCE_EXHAUSTED|rate.?limit|quota exceeded|too many requests/i.test(body);
}

function isGeminiLimitException(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /429|quota|rate.?limit|resource.?exhausted|too many requests/i.test(message);
}

async function callGemini(messages: ChatMessage[]): Promise<ProviderResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return {
      text: '',
      meta: { provider_attempted: ['gemini'], fallback_reason: 'missing_api_key' },
    };
  }

  const modelName = process.env.GEMINI_MODEL?.trim() || 'gemini-2.0-flash';
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: PHARMACIST_PERSONA,
  });

  const history = messages.slice(0, -1).map((message) => ({
    role: message.role === 'user' ? ('user' as const) : ('model' as const),
    parts: [{ text: message.content }],
  }));

  const latestUserMessage = messages.at(-1)?.content ?? '';
  const chat = model.startChat({ history });

  try {
    const result = await chat.sendMessage(latestUserMessage);
    const text = result.response.text().trim();
    if (!text) {
      return {
        text: '',
        meta: { provider_attempted: ['gemini'], fallback_reason: 'empty_response' },
      };
    }
    return {
      text,
      meta: { provider_attempted: ['gemini'], provider_used: 'gemini' },
    };
  } catch (error) {
    if (isGeminiLimitException(error)) {
      return {
        text: '',
        meta: { provider_attempted: ['gemini'], fallback_reason: 'rate_limit' },
      };
    }
    return {
      text: '',
      meta: {
        provider_attempted: ['gemini'],
        fallback_reason: 'gemini_error',
      },
    };
  }
}

function shouldUseMistralWorkflow(): boolean {
  return process.env.MISTRAL_USE_WORKFLOW?.trim() === '1';
}

function getMistralWorkflowIdentifier(): string {
  return process.env.MISTRAL_WORKFLOW_IDENTIFIER?.trim() || 'noor-pharmacist-chat';
}

function getMistralWorkflowTimeoutSeconds(): number {
  const raw = Number(process.env.MISTRAL_WORKFLOW_TIMEOUT_SECONDS ?? '30');
  return Number.isFinite(raw) && raw > 0 ? raw : 30;
}

function extractWorkflowReply(payload: unknown): string {
  if (typeof payload === 'string') {
    return payload.trim();
  }

  if (!payload || typeof payload !== 'object') {
    return '';
  }

  const record = payload as Record<string, unknown>;

  if (typeof record.message === 'string') {
    return record.message.trim();
  }

  if (typeof record.result === 'string') {
    return record.result.trim();
  }

  if (record.result && typeof record.result === 'object') {
    const nested = record.result as Record<string, unknown>;
    if (typeof nested.message === 'string') {
      return nested.message.trim();
    }
    if (typeof nested.reply === 'string') {
      return nested.reply.trim();
    }
  }

  return '';
}

async function callMistralWorkflow(messages: ChatMessage[]): Promise<ProviderResult> {
  const apiKeys = resolveMistralApiKeys();
  if (apiKeys.length === 0) {
    return {
      text: '',
      meta: { provider_attempted: ['mistral'], fallback_reason: 'missing_api_key' },
    };
  }

  const baseUrl = (process.env.MISTRAL_BASE_URL?.trim() || 'https://api.mistral.ai/v1').replace(
    /\/$/,
    '',
  );
  const workflowId = getMistralWorkflowIdentifier();
  const timeoutSeconds = getMistralWorkflowTimeoutSeconds();

  let lastReason = 'workflow_unavailable';

  for (const apiKey of apiKeys) {
    try {
      const response = await fetch(`${baseUrl}/workflows/${workflowId}/execute`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { messages },
          wait_for_result: true,
          timeout_seconds: timeoutSeconds,
        }),
      });

      const body = await response.text();
      if (!response.ok) {
        lastReason = isGeminiLimitError(response.status, body) ? 'rate_limit' : 'http_error';
        continue;
      }

      const payload = JSON.parse(body) as Record<string, unknown>;
      const text =
        extractWorkflowReply(payload.result) ||
        extractWorkflowReply(payload.output) ||
        extractWorkflowReply(payload);

      if (!text) {
        lastReason = 'empty_response';
        continue;
      }

      return {
        text,
        meta: {
          provider_attempted: ['mistral'],
          provider_used: 'mistral',
          provider_mode: 'workflow',
        },
      };
    } catch {
      lastReason = 'exception';
    }
  }

  return {
    text: '',
    meta: { provider_attempted: ['mistral'], fallback_reason: lastReason },
  };
}

async function callMistral(messages: ChatMessage[]): Promise<ProviderResult> {
  const apiKeys = resolveMistralApiKeys();
  if (apiKeys.length === 0) {
    return {
      text: '',
      meta: { provider_attempted: ['mistral'], fallback_reason: 'missing_api_key' },
    };
  }

  const model = process.env.MISTRAL_MODEL?.trim() || 'mistral-large-latest';
  const baseUrl = (process.env.MISTRAL_BASE_URL?.trim() || 'https://api.mistral.ai/v1').replace(
    /\/$/,
    '',
  );

  const mistralMessages = [
    { role: 'system', content: PHARMACIST_PERSONA },
    ...messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  ];

  let lastReason = 'all_keys_failed';

  for (const apiKey of apiKeys) {
    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: mistralMessages,
          temperature: 0.2,
        }),
      });

      const body = await response.text();
      if (!response.ok) {
        lastReason = isGeminiLimitError(response.status, body) ? 'rate_limit' : 'http_error';
        continue;
      }

      const payload = JSON.parse(body) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const text = payload.choices?.[0]?.message?.content?.trim() ?? '';
      if (!text) {
        lastReason = 'empty_response';
        continue;
      }

      return {
        text,
        meta: {
          provider_attempted: ['mistral'],
          provider_used: 'mistral',
          provider_mode: 'completions',
        },
      };
    } catch {
      lastReason = 'exception';
    }
  }

  return {
    text: '',
    meta: { provider_attempted: ['mistral'], fallback_reason: lastReason },
  };
}

const FALLBACK_MESSAGE =
  'Ospravedlňujem sa, asistent je dočasne nedostupný. Skúste to, prosím, o chvíľu alebo nás kontaktujte priamo.';

// Export individual provider functions for benchmarking and testing
export async function callGeminiDirect(messages: ChatMessage[]): Promise<ProviderResult> {
  return callGemini(messages);
}

export async function callMistralDirect(messages: ChatMessage[]): Promise<ProviderResult> {
  return callMistral(messages);
}

export async function callMistralWorkflowDirect(messages: ChatMessage[]): Promise<ProviderResult> {
  return callMistralWorkflow(messages);
}

// Provider types for A/B testing
export type AiProvider = 'gemini' | 'mistral' | 'mistral-workflow' | 'auto';

export async function generateChatReply(
  messages: ChatMessage[],
  provider?: AiProvider,
): Promise<{
  message: string;
  llm_meta: LlmMeta;
}> {
  const providerAttempted: Array<'gemini' | 'mistral'> = [];

  // If specific provider is requested (for A/B testing or benchmarking)
  if (provider && provider !== 'auto') {
    if (provider === 'gemini') {
      const result = await callGemini(messages);
      if (result.text) {
        return {
          message: result.text,
          llm_meta: {
            provider_attempted: ['gemini'],
            provider_used: 'gemini',
            provider_mode: result.meta.provider_mode,
          },
        };
      }
      return {
        message: FALLBACK_MESSAGE,
        llm_meta: {
          provider_attempted: ['gemini'],
          provider_used: null,
          fallback_reason: result.meta.fallback_reason,
        },
      };
    }

    if (provider === 'mistral-workflow') {
      const result = await callMistralWorkflow(messages);
      if (result.text) {
        return {
          message: result.text,
          llm_meta: {
            provider_attempted: ['mistral'],
            provider_used: 'mistral',
            provider_mode: 'workflow',
          },
        };
      }
      return {
        message: FALLBACK_MESSAGE,
        llm_meta: {
          provider_attempted: ['mistral'],
          provider_used: null,
          fallback_reason: result.meta.fallback_reason,
        },
      };
    }

    if (provider === 'mistral') {
      const result = await callMistral(messages);
      if (result.text) {
        return {
          message: result.text,
          llm_meta: {
            provider_attempted: ['mistral'],
            provider_used: 'mistral',
            provider_mode: result.meta.provider_mode ?? 'completions',
          },
        };
      }
      return {
        message: FALLBACK_MESSAGE,
        llm_meta: {
          provider_attempted: ['mistral'],
          provider_used: null,
          fallback_reason: result.meta.fallback_reason,
        },
      };
    }
  }

  // Default auto behavior: try Gemini first, then Mistral
  const geminiResult = await callGemini(messages);
  providerAttempted.push('gemini');

  if (geminiResult.text) {
    return {
      message: geminiResult.text,
      llm_meta: {
        provider_attempted: providerAttempted,
        provider_used: 'gemini',
      },
    };
  }

  providerAttempted.push('mistral');

  if (shouldUseMistralWorkflow()) {
    const workflowResult = await callMistralWorkflow(messages);
    if (workflowResult.text) {
      return {
        message: workflowResult.text,
        llm_meta: {
          provider_attempted: providerAttempted,
          provider_used: 'mistral',
          provider_mode: 'workflow',
          fallback_reason: geminiResult.meta.fallback_reason,
        },
      };
    }
  }

  const mistralResult = await callMistral(messages);

  if (mistralResult.text) {
    return {
      message: mistralResult.text,
      llm_meta: {
        provider_attempted: providerAttempted,
        provider_used: 'mistral',
        provider_mode: mistralResult.meta.provider_mode ?? 'completions',
        fallback_reason: geminiResult.meta.fallback_reason,
      },
    };
  }

  return {
    message: FALLBACK_MESSAGE,
    llm_meta: {
      provider_attempted: providerAttempted,
      provider_used: null,
      fallback_reason: mistralResult.meta.fallback_reason ?? geminiResult.meta.fallback_reason,
    },
  };
}
