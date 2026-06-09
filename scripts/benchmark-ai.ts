#!/usr/bin/env tsx
/**
 * AI Provider Benchmark Script
 * 
 * Usage:
 *   npm run benchmark:ai
 *   # or with custom prompts
 *   npx tsx scripts/benchmark-ai.ts --prompts "What is AI?" "Explain quantum computing"
 *   # or with specific prompts file
 *   npx tsx scripts/benchmark-ai.ts --file ./prompts.json
 *   # or with workflow disabled
 *   npx tsx scripts/benchmark-ai.ts --no-workflow
 */

import {
  runFullBenchmark,
  runComparisonBenchmark,
  formatBenchmarkResults,
  DEFAULT_BENCHMARK_PROMPTS,
} from '@/app/lib/ai/benchmark';

interface Options {
  prompts?: string[];
  file?: string;
  workflow?: boolean;
  single?: string;
  help?: boolean;
}

function parseArgs(): Options {
  const args = process.argv.slice(2);
  const options: Options = {
    workflow: true,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      options.help = true;
      break;
    }
    
    if (arg === '--no-workflow') {
      options.workflow = false;
      continue;
    }
    
    if (arg === '--prompts' || arg === '-p') {
      options.prompts = [];
      while (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        options.prompts.push(args[++i]);
      }
      continue;
    }
    
    if (arg === '--file' || arg === '-f') {
      options.file = args[++i];
      continue;
    }
    
    if (arg === '--single' || arg === '-s') {
      options.single = args[++i];
      continue;
    }
  }

  return options;
}

function printHelp() {
  console.log(`
AI Provider Benchmark Tool
==========================

Usage: npx tsx scripts/benchmark-ai.ts [options]

Options:
  --prompts, -p    Custom prompts to benchmark (space-separated)
  --file, -f      JSON file containing prompts array
  --single, -s    Run single comparison on a prompt
  --no-workflow   Disable Mistral workflow benchmarking
  --help, -h      Show this help

Examples:
  # Run default benchmark
  npm run benchmark:ai

  # Run with custom prompts
  npx tsx scripts/benchmark-ai.ts -p "What is AI?" "Explain quantum computing"

  # Run with prompts from file
  npx tsx scripts/benchmark-ai.ts -f ./my-prompts.json

  # Run single comparison
  npx tsx scripts/benchmark-ai.ts -s "What is the best supplement for sleep?"

  # Disable workflow testing
  npx tsx scripts/benchmark-ai.ts --no-workflow

Environment Variables:
  GEMINI_API_KEY     - Google Gemini API key
  MISTRAL_API_KEY    - Mistral API key
  MISTRAL_USE_WORKFLOW=1 - Enable Mistral workflow (if testing workflows)

Note: Both API keys are required for full benchmark.
`);
}

async function loadPromptsFromFile(filePath: string): Promise<string[]> {
  try {
    const fs = await import('fs/promises');
    const content = await fs.readFile(filePath, 'utf-8');
    const prompts = JSON.parse(content);
    if (!Array.isArray(prompts)) {
      throw new Error('File must contain an array of strings');
    }
    return prompts.map((p) => String(p));
  } catch (error) {
    console.error(`Error loading prompts from file: ${error}`);
    process.exit(1);
  }
}

async function main() {
  const options = parseArgs();

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  // Check API keys
  const hasGeminiKey = !!process.env.GEMINI_API_KEY?.trim();
  const hasMistralKey = !!process.env.MISTRAL_API_KEY?.trim();

  if (!hasGeminiKey || !hasMistralKey) {
    console.warn('⚠️  Warning: Missing API keys');
    if (!hasGeminiKey) console.warn('   GEMINI_API_KEY not set');
    if (!hasMistralKey) console.warn('   MISTRAL_API_KEY not set');
    console.warn('   Benchmark will only test available providers\n');
  }

  let prompts: string[];

  if (options.single) {
    // Single comparison mode
    console.log(`\n🔍 Running single comparison: "${options.single}"\n`);
    
    const result = await runComparisonBenchmark(options.single, options.workflow);
    
    console.log(formatBenchmarkResults([result], {
      totalPrompts: 1,
      geminiSuccess: result.gemini?.success ? 1 : 0,
      mistralSuccess: result.mistral?.success ? 1 : 0,
      workflowSuccess: result.mistralWorkflow?.success ? 1 : 0,
      avgGeminiTime: result.gemini?.durationMs ?? 0,
      avgMistralTime: result.mistral?.durationMs ?? 0,
      avgWorkflowTime: result.mistralWorkflow?.durationMs ?? 0,
      fastestProvider: result.comparison.fastest
        ? { [result.comparison.fastest]: { count: 1, provider: result.comparison.fastest } }
        : { gemini: { count: 0, provider: 'gemini' } },
    }));
    
    process.exit(0);
  }

  // Load prompts
  if (options.file) {
    prompts = await loadPromptsFromFile(options.file);
  } else if (options.prompts?.length) {
    prompts = options.prompts;
  } else {
    prompts = DEFAULT_BENCHMARK_PROMPTS;
  }

  console.log(`\n🚀 Starting AI Provider Benchmark`);
  console.log(`   Prompts: ${prompts.length}`);
  console.log(`   Workflow: ${options.workflow ? 'Enabled' : 'Disabled'}`);
  console.log(`   Gemini API: ${hasGeminiKey ? '✓ Available' : '✗ Not configured'}`);
  console.log(`   Mistral API: ${hasMistralKey ? '✓ Available' : '✗ Not configured'}\n`);

  console.log('💡 This may take a few minutes...\n');

  try {
    const { results, summary } = await runFullBenchmark(prompts, options.workflow);
    console.log(formatBenchmarkResults(results, summary));
    
    // Exit with error if no providers succeeded
    if (summary.geminiSuccess === 0 && summary.mistralSuccess === 0) {
      console.error('\n❌ All providers failed. Check your API keys and network connection.');
      process.exit(1);
    }
  } catch (error) {
    console.error(`\n❌ Benchmark failed: ${error}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(`Fatal error: ${error}`);
  process.exit(1);
});
