import type { ChatMessage } from './types';
import {
  callGeminiDirect,
  callMistralDirect,
  callMistralWorkflowDirect,
  type AiProvider,
} from './providers';

interface BenchmarkResult {
  provider: AiProvider;
  prompt: string;
  response: string;
  durationMs: number;
  success: boolean;
  error?: string;
  tokens?: number;
}

interface BenchmarkSummary {
  totalPrompts: number;
  geminiSuccess: number;
  mistralSuccess: number;
  workflowSuccess: number;
  avgGeminiTime: number;
  avgMistralTime: number;
  avgWorkflowTime: number;
  fastestProvider: Record<string, { count: number; provider: AiProvider }>;
}

interface ComparisonResult {
  prompt: string;
  gemini: BenchmarkResult | null;
  mistral: BenchmarkResult | null;
  mistralWorkflow: BenchmarkResult | null;
  winner?: AiProvider;
  comparison: {
    lengthDiff: number;
    geminiLength: number;
    mistralLength: number;
    timeDiffMs: number;
    fastest: AiProvider | null;
  };
}

/**
 * Default prompts for benchmarking - pharmacist/lifestyle related
 */
export const DEFAULT_BENCHMARK_PROMPTS: string[] = [
  'Aký produkt odporúčaš na zlepšenie spánku?',
  'Mám problémy s imunitou, čí máte niektoré doplnky?',
  'Ako sa dajú kombinovať vitamíny C a D?',
  'Čo je najlepší na Podzimné vyčerpanie?',
  'Mám alergiu na laktózu, čo by som mal/a vynechať?',
  'Aký je rozdiel medzi omega-3 a omega-6 mastnými kyselinami?',
  'Odporučte mi niečo na klbovú bolest',
  'Ako dlho trvá, kým sa prejaví účinky kurkumy?',
  'Môžu brať magnéziu a železo spolu?',
  'Čo je to adaptogén a ako funguje?',
];

/**
 * Run a single benchmark for a provider
 */
export async function runProviderBenchmark(
  provider: AiProvider,
  prompt: string,
  messages: ChatMessage[] = [{ role: 'user', content: prompt }],
): Promise<BenchmarkResult> {
  const startTime = Date.now();

  try {
    let result;
    switch (provider) {
      case 'gemini':
        result = await callGeminiDirect(messages);
        break;
      case 'mistral':
        result = await callMistralDirect(messages);
        break;
      case 'mistral-workflow':
        result = await callMistralWorkflowDirect(messages);
        break;
      default:
        return {
          provider,
          prompt,
          response: '',
          durationMs: Date.now() - startTime,
          success: false,
          error: `Unknown provider: ${provider}`,
        };
    }

    const durationMs = Date.now() - startTime;

    if (result.text && result.meta.provider_used) {
      return {
        provider,
        prompt,
        response: result.text,
        durationMs,
        success: true,
        tokens: result.text.split(/\s+/).length,
      };
    }

    return {
      provider,
      prompt,
      response: result.text || '',
      durationMs,
      success: false,
      error: result.meta.fallback_reason || 'No response',
    };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    return {
      provider,
      prompt,
      response: '',
      durationMs,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Run benchmark for all providers on a single prompt
 */
export async function runComparisonBenchmark(
  prompt: string,
  includeWorkflow: boolean = true,
): Promise<ComparisonResult> {
  const messages: ChatMessage[] = [{ role: 'user', content: prompt }];

  const [geminiResult, mistralResult, workflowResult] = await Promise.all([
    runProviderBenchmark('gemini', prompt, messages),
    runProviderBenchmark('mistral', prompt, messages),
    includeWorkflow
      ? runProviderBenchmark('mistral-workflow', prompt, messages)
      : Promise.resolve(null),
  ]);

  const gemini = geminiResult.success ? geminiResult : null;
  const mistral = mistralResult.success ? mistralResult : null;
  const mistralWorkflow = workflowResult?.success ? workflowResult : null;

  // Calculate comparison metrics
  const geminiLength = gemini?.response.length || 0;
  const mistralLength = mistral?.response.length || 0;
  const lengthDiff = geminiLength - mistralLength;

  const geminiTime = gemini?.durationMs || Infinity;
  const mistralTime = mistral?.durationMs || Infinity;
  const workflowTime = mistralWorkflow?.durationMs || Infinity;

  const times: Record<AiProvider, number> = {
    gemini: geminiTime,
    mistral: mistralTime,
    'mistral-workflow': workflowTime,
    auto: Infinity,
  };
  const fastest = (Object.entries(times) as Array<[AiProvider, number]>).reduce(
    (currentFastest, [provider, time]) =>
      time < times[currentFastest] ? provider : currentFastest,
    'gemini' as AiProvider,
  );

  // Determine winner based on response quality (simplified: longer = better for info)
  let winner: AiProvider | undefined;
  if (gemini && mistral) {
    // Simple heuristic: prefer longer, more detailed responses
    if (geminiLength > mistralLength * 1.2) winner = 'gemini';
    else if (mistralLength > geminiLength * 1.2) winner = 'mistral';
    else winner = fastest === 'gemini' ? 'gemini' : 'mistral';
  } else if (gemini) {
    winner = 'gemini';
  } else if (mistral) {
    winner = 'mistral';
  }

  return {
    prompt,
    gemini,
    mistral,
    mistralWorkflow,
    winner,
    comparison: {
      lengthDiff,
      geminiLength,
      mistralLength,
      timeDiffMs: geminiTime - mistralTime,
      fastest: times[fastest] === Infinity ? null : fastest,
    },
  };
}

/**
 * Run full benchmark suite on multiple prompts
 */
export async function runFullBenchmark(
  prompts: string[] = DEFAULT_BENCHMARK_PROMPTS,
  includeWorkflow: boolean = true,
): Promise<{
  results: ComparisonResult[];
  summary: BenchmarkSummary;
}> {
  const results: ComparisonResult[] = [];

  for (const prompt of prompts) {
    const result = await runComparisonBenchmark(prompt, includeWorkflow);
    results.push(result);
  }

  // Calculate summary
  let geminiSuccess = 0;
  let mistralSuccess = 0;
  let workflowSuccess = 0;
  let totalGeminiTime = 0;
  let totalMistralTime = 0;
  let totalWorkflowTime = 0;

  const fastestCounts: Record<AiProvider, number> = {
    gemini: 0,
    mistral: 0,
    'mistral-workflow': 0,
    auto: 0,
  };

  for (const result of results) {
    if (result.gemini?.success) {
      geminiSuccess++;
      totalGeminiTime += result.gemini.durationMs;
    }
    if (result.mistral?.success) {
      mistralSuccess++;
      totalMistralTime += result.mistral.durationMs;
    }
    if (result.mistralWorkflow?.success) {
      workflowSuccess++;
      totalWorkflowTime += result.mistralWorkflow.durationMs;
    }

    if (result.comparison.fastest) {
      fastestCounts[result.comparison.fastest]++;
    }
  }

  const avgGeminiTime = geminiSuccess > 0 ? totalGeminiTime / geminiSuccess : 0;
  const avgMistralTime = mistralSuccess > 0 ? totalMistralTime / mistralSuccess : 0;
  const avgWorkflowTime = workflowSuccess > 0 ? totalWorkflowTime / workflowSuccess : 0;

  // Find most frequent fastest
  const fastestProvider = Object.entries(fastestCounts).reduce(
    (max, [provider, count]) => (count > max.count ? { count, provider: provider as AiProvider } : max),
    { count: 0, provider: 'gemini' as AiProvider },
  );

  return {
    results,
    summary: {
      totalPrompts: prompts.length,
      geminiSuccess,
      mistralSuccess,
      workflowSuccess,
      avgGeminiTime,
      avgMistralTime,
      avgWorkflowTime,
      fastestProvider: {
        [fastestProvider.provider]: fastestProvider,
      },
    },
  };
}

/**
 * Format benchmark results for console output
 */
export function formatBenchmarkResults(
  results: ComparisonResult[],
  summary: BenchmarkSummary,
): string {
  const lines: string[] = [];

  lines.push('='.repeat(80));
  lines.push('AI PROVIDER BENCHMARK RESULTS');
  lines.push('='.repeat(80));
  lines.push('');

  // Individual prompt results
  for (const result of results) {
    lines.push(`Prompt: "${result.prompt}"`);
    lines.push('-'.repeat(60));

    if (result.gemini) {
      lines.push(
        `  ✓ Gemini: ${result.gemini.response.slice(0, 100)}${result.gemini.response.length > 100 ? '...' : ''} (${result.gemini.durationMs}ms, ${result.gemini.tokens || 0} tokens)`,
      );
    } else {
      lines.push('  ✗ Gemini: Failed - No API key');
    }

    if (result.mistral) {
      lines.push(
        `  ✓ Mistral: ${result.mistral.response.slice(0, 100)}${result.mistral.response.length > 100 ? '...' : ''} (${result.mistral.durationMs}ms, ${result.mistral.tokens || 0} tokens)`,
      );
    } else {
      lines.push('  ✗ Mistral: Failed - No API key');
    }

    if (result.mistralWorkflow) {
      lines.push(
        `  ✓ Mistral Workflow: ${result.mistralWorkflow.response.slice(0, 100)}... (${result.mistralWorkflow.durationMs}ms)`,
      );
    }

    if (result.winner) {
      lines.push(`  🏆 Winner: ${result.winner}`);
    }

    lines.push('');
  }

  // Summary
  lines.push('='.repeat(80));
  lines.push('SUMMARY');
  lines.push('='.repeat(80));
  lines.push(`Total prompts: ${summary.totalPrompts}`);
  lines.push(`Gemini success: ${summary.geminiSuccess}/${summary.totalPrompts}`);
  lines.push(`Mistral success: ${summary.mistralSuccess}/${summary.totalPrompts}`);
  lines.push(`Workflow success: ${summary.workflowSuccess}/${summary.totalPrompts}`);
  lines.push('');
  lines.push(`Average response times:`);
  lines.push(`  Gemini: ${summary.avgGeminiTime.toFixed(0)}ms`);
  lines.push(`  Mistral: ${summary.avgMistralTime.toFixed(0)}ms`);
  lines.push(`  Mistral Workflow: ${summary.avgWorkflowTime.toFixed(0)}ms`);
  lines.push('');

  const fastest = Object.entries(summary.fastestProvider)[0];
  if (fastest) {
    lines.push(`Most frequent fastest: ${fastest[0]} (${fastest[1].count} times)`);
  }

  lines.push('='.repeat(80));

  return lines.join('\n');
}
