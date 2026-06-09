export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatRequestBody {
  messages: ChatMessage[];
  conversation_id?: string;
}

export interface LlmMeta {
  provider_attempted: Array<'gemini' | 'mistral'>;
  provider_used: 'gemini' | 'mistral' | null;
  provider_mode?: 'workflow' | 'completions';
  fallback_reason?: string;
}

export interface ChatResponseBody {
  message: string;
  conversation_id?: string;
  suggested_replies?: string[];
  llm_meta?: LlmMeta;
}
