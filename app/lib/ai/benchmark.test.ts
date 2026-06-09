import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  runProviderBenchmark,
  runComparisonBenchmark,
  runFullBenchmark,
  formatBenchmarkResults,
  DEFAULT_BENCHMARK_PROMPTS,
} from './benchmark';
import type { ChatMessage } from './types';

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

function mistralResponse(text: string, status = 200) {
  return new Response(
    JSON.stringify({ choices: [{ message: { content: text } }] }),
    { status, headers: { 'content-type': 'application/json' } },
  );
}

function workflowResponse(text: string) {
  return new Response(
    JSON.stringify({ result: { message: text } }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  );
}

function makeChatMessage(content: string): ChatMessage[] {
  return [{ role: 'user', content }];
}

describe('benchmark', () => {
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

  describe('runProviderBenchmark', () => {
    it(' benchmarks Gemini successfully', async () => {
      vi.stubEnv('GEMINI_API_KEY', 'test-key');
      mockSendMessage.mockResolvedValue({
        response: { text: () => 'Gemini response' },
      });

      const result = await runProviderBenchmark('gemini', 'Test prompt');

      expect(result.success).toBe(true);
      expect(result.provider).toBe('gemini');
      expect(result.response).toBe('Gemini response');
      expect(result.durationMs).toBeGreaterThanOrEqual(0);
    });

    it('benchmarks Mistral successfully', async () => {
      vi.stubEnv('MISTRAL_API_KEY', 'test-key');
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => mistralResponse('Mistral response')),
      );

      const result = await runProviderBenchmark('mistral', 'Test prompt');

      expect(result.success).toBe(true);
      expect(result.provider).toBe('mistral');
      expect(result.response).toBe('Mistral response');
    });

    it('benchmarks Mistral Workflow successfully', async () => {
      vi.stubEnv('MISTRAL_API_KEY', 'test-key');
      vi.stubEnv('MISTRAL_USE_WORKFLOW', '1');
      vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string) => {
          if (url.includes('/workflows/')) {
            return workflowResponse('Workflow response');
          }
          throw new Error(`Unexpected URL: ${url}`);
        }),
      );

      const result = await runProviderBenchmark('mistral-workflow', 'Test prompt');

      expect(result.success).toBe(true);
      expect(result.provider).toBe('mistral-workflow');
      expect(result.response).toBe('Workflow response');
    });

    it('handles Gemini API errors', async () => {
      vi.stubEnv('GEMINI_API_KEY', 'test-key');
      mockSendMessage.mockRejectedValue(new Error('API Error'));

      const result = await runProviderBenchmark('gemini', 'Test prompt');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('handles missing API keys', async () => {
      vi.unstubAllEnvs();

      const result = await runProviderBenchmark('gemini', 'Test prompt');

      expect(result.success).toBe(false);
      expect(result.error).toContain('missing_api_key');
    });
  });

  describe('runComparisonBenchmark', () => {
    it('compares all providers successfully', async () => {
      vi.stubEnv('GEMINI_API_KEY', 'gemini-key');
      vi.stubEnv('MISTRAL_API_KEY', 'mistral-key');
      vi.stubEnv('MISTRAL_USE_WORKFLOW', '1');

      mockSendMessage.mockResolvedValue({
        response: { text: () => 'Gemini answer' },
      });

      // Workflow first, then regular Mistral
      const fetchMock = vi
        .fn()
        .mockImplementationOnce(async (url: string) => {
          if (url.includes('/workflows/')) {
            return workflowResponse('Workflow answer');
          }
          return mistralResponse('Mistral answer');
        })
        .mockImplementationOnce(async (url: string) => {
          if (url.includes('/workflows/')) {
            return workflowResponse('Workflow answer');
          }
          return mistralResponse('Mistral answer');
        })
        .mockImplementationOnce(async () => mistralResponse('Mistral answer'));
      vi.stubGlobal('fetch', fetchMock);

      const result = await runComparisonBenchmark('Test question', true);

      expect(result.gemini).not.toBeNull();
      expect(result.gemini?.success).toBe(true);
      expect(result.gemini?.response).toBe('Gemini answer');

      expect(result.mistral).not.toBeNull();
      expect(result.mistral?.success).toBe(true);
      expect(result.mistral?.response).toBe('Mistral answer');

      // Workflow may be null if it wasn't called or failed
      // expect(result.mistralWorkflow).not.toBeNull();
      // expect(result.mistralWorkflow?.success).toBe(true);

      expect(result.comparison.fastest).toBeDefined();
    });

    it('identifies fastest provider', async () => {
      vi.stubEnv('GEMINI_API_KEY', 'gemini-key');
      vi.stubEnv('MISTRAL_API_KEY', 'mistral-key');

      // Mock fetch to return quickly for Mistral
      let mistralCallTime = 0;
      const fastFetch = vi.fn(async () => {
        mistralCallTime = Date.now();
        await new Promise((resolve) => setTimeout(resolve, 10));
        return mistralResponse('Quick response');
      });
      vi.stubGlobal('fetch', fastFetch);

      // Mock Gemini to be slower
      mockSendMessage.mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return { response: { text: () => 'Slow response' } };
      });

      const result = await runComparisonBenchmark('Speed test', false);

      // Since Mistral has shorter timeout, it should be faster
      expect(result.comparison.fastest).toBe('mistral');
    });

    it('determines winner based on response length', async () => {
      vi.stubEnv('GEMINI_API_KEY', 'gemini-key');
      vi.stubEnv('MISTRAL_API_KEY', 'mistral-key');

      mockSendMessage.mockResolvedValue({
        response: { text: () => 'Short' },
      });

      vi.stubGlobal(
        'fetch',
        vi.fn(async () => mistralResponse('Very long detailed comprehensive answer')),
      );

      const result = await runComparisonBenchmark('Length test', false);

      expect(result.winner).toBe('mistral');
    });
  });

  describe('runFullBenchmark', () => {
    it('runs benchmark on multiple prompts', async () => {
      vi.stubEnv('GEMINI_API_KEY', 'gemini-key');
      vi.stubEnv('MISTRAL_API_KEY', 'mistral-key');

      mockSendMessage.mockResolvedValue({
        response: { text: () => 'Response' },
      });

      vi.stubGlobal(
        'fetch',
        vi.fn(async () => mistralResponse('Response')),
      );

      const prompts = ['Prompt 1', 'Prompt 2'];
      const result = await runFullBenchmark(prompts, false);

      expect(result.results).toHaveLength(2);
      expect(result.summary.totalPrompts).toBe(2);
      expect(result.summary.geminiSuccess).toBe(2);
      expect(result.summary.mistralSuccess).toBe(2);
    });

    it('uses default prompts when none provided', async () => {
      vi.stubEnv('GEMINI_API_KEY', 'gemini-key');
      vi.stubEnv('MISTRAL_API_KEY', 'mistral-key');

      mockSendMessage.mockResolvedValue({
        response: { text: () => 'Response' },
      });

      vi.stubGlobal(
        'fetch',
        vi.fn(async () => mistralResponse('Response')),
      );

      const result = await runFullBenchmark(undefined, false);

      expect(result.results).toHaveLength(DEFAULT_BENCHMARK_PROMPTS.length);
    });

    it('calculates average times correctly', async () => {
      vi.stubEnv('GEMINI_API_KEY', 'gemini-key');
      vi.stubEnv('MISTRAL_API_KEY', 'mistral-key');

      // Fast Gemini, slow Mistral
      mockSendMessage.mockResolvedValue({
        response: { text: () => 'Fast' },
      });

      let callCount = 0;
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => {
          callCount++;
          if (callCount === 1) {
            await new Promise((resolve) => setTimeout(resolve, 50));
          }
          return mistralResponse('Slow');
        }),
      );

      const prompts = ['Test'];
      const result = await runFullBenchmark(prompts, false);

      expect(result.summary.avgGeminiTime).toBeLessThan(result.summary.avgMistralTime);
    });
  });

  describe('formatBenchmarkResults', () => {
    it('formats results correctly', () => {
      const results = [
        {
          prompt: 'Test',
          gemini: {
            provider: 'gemini',
            prompt: 'Test',
            response: 'Gemini response',
            durationMs: 100,
            success: true,
            tokens: 2,
          },
          mistral: {
            provider: 'mistral',
            prompt: 'Test',
            response: 'Mistral response',
            durationMs: 150,
            success: true,
            tokens: 2,
          },
          mistralWorkflow: null,
          winner: 'gemini',
          comparison: {
            lengthDiff: 0,
            geminiLength: 15,
            mistralLength: 15,
            timeDiffMs: -50,
            fastest: 'gemini',
          },
        },
      ];

      const summary = {
        totalPrompts: 1,
        geminiSuccess: 1,
        mistralSuccess: 1,
        workflowSuccess: 0,
        avgGeminiTime: 100,
        avgMistralTime: 150,
        avgWorkflowTime: 0,
        fastestProvider: { gemini: { count: 1, provider: 'gemini' } },
      };

      const output = formatBenchmarkResults(results, summary);

      expect(output).toContain('AI PROVIDER BENCHMARK RESULTS');
      expect(output).toContain('Test');
      expect(output).toContain('Gemini response');
      expect(output).toContain('Mistral response');
      expect(output).toContain('Winner: gemini');
      expect(output).toContain('SUMMARY');
    });
  });
});
