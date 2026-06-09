# AI Provider Benchmarking & A/B Testing

This document describes the AI provider benchmarking and A/B testing capabilities for the NOOR chatbot, which supports both **Google Gemini** and **Mistral AI** providers.

## Overview

The system implements:
1. **Provider Fallback**: Automatic fallback from Gemini → Mistral Workflow → Mistral API
2. **Benchmarking**: Compare response quality, speed, and reliability between providers
3. **A/B Testing**: Production testing with random provider assignment

## Architecture

```
app/lib/ai/
├── providers.ts          # Core provider logic (Gemini, Mistral, Workflow)
├── benchmark.ts          # Benchmarking functions
├── benchmark.test.ts     # Benchmark tests
├── types.ts             # Type definitions
└── persona.ts            # Pharmacist persona

app/api/chat/
└── route.ts              # API endpoint with A/B testing support

scripts/
└── benchmark-ai.ts       # CLI benchmark tool
```

## Provider Priority

By default, the system tries providers in this order:

1. **Google Gemini** (primary)
2. **Mistral Workflow** (if `MISTRAL_USE_WORKFLOW=1`)
3. **Mistral API** (direct completions)
4. **Fallback message** (if all fail)

## Usage

### 1. Running Tests

```bash
# Run all AI tests (providers, API, UI, benchmark)
npm run test:ai

# Run only benchmark tests
npm run test:ai:benchmark

# Watch mode
npm run test:watch
```

### 2. Running Benchmark

#### Default Benchmark (10 pharmacist-related prompts)
```bash
npm run benchmark:ai
```

#### Custom Prompts
```bash
npx tsx scripts/benchmark-ai.ts -p "What is AI?" "Explain quantum computing"
```

#### Prompts from File
Create a JSON file with prompt array:
```json
["Prompt 1", "Prompt 2", "Prompt 3"]
```

Run benchmark:
```bash
npx tsx scripts/benchmark-ai.ts -f ./my-prompts.json
```

#### Single Comparison
```bash
npx tsx scripts/benchmark-ai.ts -s "What is the best supplement for sleep?"
```

#### Disable Workflow Testing
```bash
npx tsx scripts/benchmark-ai.ts --no-workflow
```

### 3. A/B Testing in Production

#### Enable A/B Testing
Set environment variable:
```bash
AI_AB_TESTING=1
```

This will randomly assign users to either Gemini or Mistral (50/50 split).

#### Enable A/B Logging
To log provider assignments for analytics:
```bash
AI_AB_LOGGING=1
```

Logs are written to stdout as JSON:
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "event": "ab_assignment",
  "session_id": "user-session-123",
  "assigned_provider": "gemini",
  "user_agent": "Mozilla/5.0...",
  "path": "/api/chat"
}
```

#### Force Specific Provider

**Via Query Parameter:**
```bash
curl -X POST 'http://localhost:3001/api/chat?provider=gemini' \
  -H 'Content-Type: application/json' \
  -d '{"messages": [{"role": "user", "content": "Hello"}]}'
```

**Via Header:**
```bash
curl -X POST 'http://localhost:3001/api/chat' \
  -H 'Content-Type: application/json' \
  -H 'x-ai-provider: mistral' \
  -d '{"messages": [{"role": "user", "content": "Hello"}]}'
```

Available providers: `gemini`, `mistral`, `mistral-workflow`, `auto`

#### API Endpoint for A/B Status
```bash
curl http://localhost:3001/api/chat
```

Response:
```json
{
  "ab_testing_enabled": true,
  "available_providers": ["gemini", "mistral", "mistral-workflow", "auto"]
}
```

## Programmatic Usage

### Direct Provider Access

```typescript
import {
  callGeminiDirect,
  callMistralDirect,
  callMistralWorkflowDirect,
  type AiProvider
} from '@/app/lib/ai/providers';

// Call specific provider
const geminiResult = await callGeminiDirect([
  { role: 'user', content: 'Hello' }
]);

const mistralResult = await callMistralDirect([
  { role: 'user', content: 'Hello' }
]);
```

### Generate Reply with Specific Provider

```typescript
import { generateChatReply } from '@/app/lib/ai/providers';

// Auto mode (default behavior)
const { message, llm_meta } = await generateChatReply(messages);

// Force specific provider
const { message, llm_meta } = await generateChatReply(messages, 'gemini');
// or: 'mistral', 'mistral-workflow', 'auto'
```

### Run Benchmark Programmatically

```typescript
import {
  runFullBenchmark,
  runComparisonBenchmark,
  runProviderBenchmark,
  formatBenchmarkResults,
  DEFAULT_BENCHMARK_PROMPTS
} from '@/app/lib/ai/benchmark';

// Single provider benchmark
const geminiResult = await runProviderBenchmark(
  'gemini',
  'What is AI?'
);

// Compare all providers on a single prompt
const comparison = await runComparisonBenchmark(
  'What is the best supplement?',
  true // include workflow
);

// Full benchmark suite
const { results, summary } = await runFullBenchmark(
  ['Prompt 1', 'Prompt 2'],
  true
);

// Format results for console
console.log(formatBenchmarkResults(results, summary));
```

## Response Metadata

All responses include `llm_meta` with:

```typescript
{
  provider_attempted: ['gemini', 'mistral'], // Providers tried
  provider_used: 'gemini',                   // Provider that succeeded
  provider_mode: 'completions' | 'workflow', // Mode used
  fallback_reason: 'rate_limit' | null      // Why fallback occurred
}
```

## Environment Variables

### Provider Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | - |
| `GEMINI_MODEL` | Gemini model to use | `gemini-2.0-flash` |
| `MISTRAL_API_KEY` | Mistral API key | - |
| `MISTRAL_API_KEY_BACKUP` | Backup Mistral key (comma-separated) | - |
| `MISTRAL_MODEL` | Mistral model to use | `mistral-large-latest` |
| `MISTRAL_BASE_URL` | Mistral API base URL | `https://api.mistral.ai/v1` |
| `MISTRAL_USE_WORKFLOW` | Enable workflow mode | `0` (disabled) |
| `MISTRAL_WORKFLOW_IDENTIFIER` | Workflow ID | `noor-pharmacist-chat` |
| `MISTRAL_WORKFLOW_TIMEOUT_SECONDS` | Workflow timeout | `30` |

### A/B Testing Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `AI_AB_TESTING` | Enable random A/B assignment | `0` (disabled) |
| `AI_AB_LOGGING` | Log A/B assignments | `0` (disabled) |

## Benchmark Results Interpretation

The benchmark outputs:

```
AI PROVIDER BENCHMARK RESULTS
================================================================================

Prompt: "What is the best supplement for sleep?"
------------------------------------------------------------
  ✓ Gemini: Detailed response about melatonin, magnesium... (452ms, 25 tokens)
  ✓ Mistral: Comprehensive answer with scientific studies... (389ms, 30 tokens)
  🏆 Winner: mistral

================================================================================
SUMMARY
================================================================================
Total prompts: 10
Gemini success: 10/10
Mistral success: 10/10

Average response times:
  Gemini: 452ms
  Mistral: 389ms

Most frequent fastest: mistral (7 times)
================================================================================
```

### Comparison Metrics

- **Success Rate**: Number of successful responses
- **Response Time**: Average time to first token
- **Token Count**: Approximate number of words/tokens
- **Winner**: Determined by:
  - Longer, more detailed responses preferred (20%+ difference)
  - If similar length, faster provider wins

## Error Handling

Common error reasons in `fallback_reason`:

| Reason | Description |
|--------|-------------|
| `missing_api_key` | API key not configured |
| `rate_limit` | Rate limit exceeded |
| `http_error` | HTTP error from API |
| `empty_response` | API returned empty response |
| `exception` | Unexpected error occurred |

## Testing Scenarios

### Scenario 1: Validate Provider Switching
```typescript
// Test that system falls back correctly
const result = await generateChatReply(messages);
// If Gemini fails, should use Mistral
```

### Scenario 2: Force Provider for Testing
```typescript
// Test specific provider behavior
const result = await generateChatReply(messages, 'gemini');
```

### Scenario 3: A/B Test Analytics
```typescript
// Parse A/B logs to analyze provider performance
const logs = parseLogs();
const geminiConversionRate = calculateConversionRate(logs, 'gemini');
```

## Performance Considerations

- **Cold Start**: First request to a provider may be slower
- **Rate Limits**: Both providers have rate limits
- **Network Latency**: Affects both providers equally
- **Model Complexity**: Larger models produce better results but are slower

## Troubleshooting

### Benchmark Fails with API Errors

1. Verify API keys are set:
   ```bash
   echo $GEMINI_API_KEY
   echo $MISTRAL_API_KEY
   ```

2. Check rate limits:
   - Google Gemini: ~60 RPM free tier
   - Mistral: Varies by plan

3. Test individual providers:
   ```bash
   npx tsx scripts/benchmark-ai.ts -s "Test" -p gemini
   npx tsx scripts/benchmark-ai.ts -s "Test" -p mistral
   ```

### A/B Testing Not Working

1. Verify `AI_AB_TESTING=1` is set
2. Check logs for assignment events
3. Ensure no query param or header is overriding the assignment

### All Providers Return Errors

1. Check network connectivity
2. Verify API endpoints are accessible
3. Test with simplified prompts
4. Check for API key permissions

## Best Practices

1. **Start with Benchmark**: Run `npm run benchmark:ai` to establish baseline
2. **Monitor in Production**: Enable `AI_AB_LOGGING=1` to track provider performance
3. **Set Rate Limits**: Configure appropriate rate limits to avoid API bans
4. **Test Fallback**: Regularly test fallback behavior by temporarily disabling providers
5. **Compare Costs**: Consider API costs when choosing providers

## API Cost Comparison (as of 2024)

| Provider | Model | Input Token | Output Token |
|----------|-------|--------------|---------------|
| Google Gemini | gemini-2.0-flash | $0.001/1K | $0.003/1K |
| Mistral | mistral-large-latest | €0.002/1K | €0.006/1K |

*Note: Pricing changes frequently. Check official documentation.*

## Contributing

When adding new features:

1. Add tests in `benchmark.test.ts`
2. Update documentation
3. Ensure backward compatibility
4. Consider performance implications

## License

This benchmarking and A/B testing code is part of the NOOR project and is licensed under the same terms as the main project.
