import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/app/lib/firebase-admin';
import { USERS_COLLECTION } from '@/app/lib/user-profile';
import { getProducts } from '@/app/lib/shopify';

type ToolName =
  | 'search_products'
  | 'update_inventory'
  | 'generate_marketing_copy'
  | 'analyze_sales'
  | 'query_firebase_customers';

type JsonRecord = Record<string, unknown>;

interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: ToolName;
    arguments: string;
  };
}

interface ToolResult {
  id: string;
  type: 'function';
  function: {
    name: ToolName;
    arguments: JsonRecord | string;
    result: JsonRecord;
  };
}

type SearchProductsResult = {
  results: Array<{ id: string; title: string; handle: string; price: unknown }>;
  count: number;
};

type UpdateInventoryResult = {
  success: boolean;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
  action?: JsonRecord;
};

type AnalyzeSalesResult = {
  totalSales: number;
  topProducts: Array<{ id: string; title: string; sales: number; revenue: number }>;
  period: string;
};

type QueryCustomersResult = {
  customers: Array<{ id: string; email?: string; fitnessGoals?: string[] }>;
  count: number;
};

const TOOLS: Record<ToolName, (args: JsonRecord) => Promise<JsonRecord>> = {
  search_products: async (args) => {
    const query = String(args.query ?? '');
    const products = await getProducts(50);
    const filtered = products.filter(
      (p) =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.handle.toLowerCase().includes(query.toLowerCase()),
    );
    const result: SearchProductsResult = {
      results: filtered.map((p) => ({
        id: p.id,
        title: p.title,
        handle: p.handle,
        price: p.priceRange.minVariantPrice,
      })),
      count: filtered.length,
    };
    return result;
  },

  update_inventory: async (args) => {
    const result: UpdateInventoryResult = {
      success: false,
      requiresConfirmation: true,
      confirmationMessage: `Si si istý, že chceš nastaviť sklad produktu na ${String(args.quantity ?? 0)} kusov?`,
      action: {
        type: 'update_inventory',
        product_id: String(args.product_id ?? ''),
        quantity: Number(args.quantity ?? 0),
      },
    };
    return result;
  },

  generate_marketing_copy: async (args) => {
    const products = await getProducts(50);
    const product = products.find((p) => p.id === String(args.product_id ?? ''));

    if (!product) {
      throw new Error('Produkt nebol nájdený');
    }

    const baseCopy = {
      productName: product.title,
      benefits: [
        'Podpora imunitného systému',
        '100% prírodné zložky',
        'Vysoká biologická dostupnosť',
        'Vyrobené v EÚ',
      ],
      cta: 'Objednajte si už dnes!',
    };

    if (args.channel === 'instagram') {
      return {
        ...baseCopy,
        format: 'short',
        text: `🌿 ${product.title} - vaše nové zelené superpotraviny!

✨ ${baseCopy.benefits.slice(0, 2).join('\n✨ ')}

💚 ${baseCopy.cta}

#GrowMedica #Health #Wellness`,
      };
    }

    if (args.channel === 'email') {
      return {
        ...baseCopy,
        format: 'long',
        subject: `Objavte výhody ${product.title}`,
        body: `<h1>Objavte výhody ${product.title}</h1>
<p>${product.title} je tu pre vás s úžasnými výhodami:</p>
<ul>
  <li>${baseCopy.benefits[0]}</li>
  <li>${baseCopy.benefits[1]}</li>
  <li>${baseCopy.benefits[2]}</li>
</ul>
<p><strong>${baseCopy.cta}</strong></p>`,
      };
    }

    throw new Error('Nepodporovaný kanál');
  },

  analyze_sales: async (args) => {
    const result: AnalyzeSalesResult = {
      totalSales: 12500,
      topProducts: [
        { id: 'gid://shopify/Product/1', title: 'Zeen Collagen', sales: 45, revenue: 4500 },
        { id: 'gid://shopify/Product/2', title: 'Polyporus 100g', sales: 32, revenue: 3200 },
        { id: 'gid://shopify/Product/3', title: 'Reishi Extract', sales: 28, revenue: 4200 },
      ],
      period: String(args.period ?? '30 days'),
    };
    return result;
  },

  query_firebase_customers: async (args) => {
    const firestore = getAdminFirestore();
    let query: FirebaseFirestore.Query = firestore.collection(USERS_COLLECTION);

    const filter = args.filter as { goal?: string } | undefined;
    if (filter?.goal) {
      query = query.where('fitnessGoals', 'array-contains', filter.goal);
    }

    const snapshot = await query.limit(50).get();
    const customers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const result: QueryCustomersResult = {
      customers,
      count: customers.length,
    };
    return result;
  },
};

function parseToolCalls(content: string): ToolCall[] {
  const calls: ToolCall[] = [];
  const functionRegex = /(\w+)\(([^)]*)\)/g;
  let match;

  while ((match = functionRegex.exec(content)) !== null) {
    const functionName = match[1] as ToolName;
    const argsStr = match[2];

    const validFunctions: ToolName[] = [
      'search_products',
      'update_inventory',
      'generate_marketing_copy',
      'analyze_sales',
      'query_firebase_customers',
    ];

    if (validFunctions.includes(functionName)) {
      calls.push({
        id: `call_${Date.now()}_${calls.length}`,
        type: 'function',
        function: {
          name: functionName,
          arguments: argsStr,
        },
      });
    }
  }

  return calls;
}

function parseArguments(argsStr: string): JsonRecord {
  try {
    return JSON.parse(argsStr) as JsonRecord;
  } catch {
    const args: JsonRecord = {};
    const pairs = argsStr.split(',').map((p) => p.trim());

    for (const pair of pairs) {
      const [key, value] = pair.split('=').map((s) => s.trim());
      if (key && value) {
        args[key] = value.replace(/^['"]|['"]$/g, '');
      }
    }

    return args;
  }
}

function formatToolResponse(name: ToolName, result: JsonRecord): string {
  switch (name) {
    case 'search_products': {
      const data = result as SearchProductsResult;
      return `Nájdené produkty (${data.count}):\n${data.results.map((p) => `- ${p.title}`).join('\n')}`;
    }
    case 'update_inventory': {
      const data = result as UpdateInventoryResult;
      return data.requiresConfirmation
        ? `⚠️ Potvrdenie vyžadované: ${data.confirmationMessage}`
        : 'Sklad úspešne aktualizovaný';
    }
    case 'generate_marketing_copy':
      return `Vygenerovaný marketingový text:\n${String(result.text ?? result.body ?? '')}`;
    case 'analyze_sales': {
      const data = result as AnalyzeSalesResult;
      return `Analýza predajov:\nCelkové tržby: €${data.totalSales}\nTop produkty:\n${data.topProducts.map((p) => `- ${p.title}: ${p.sales} ks (€${p.revenue})`).join('\n')}`;
    }
    case 'query_firebase_customers': {
      const data = result as QueryCustomersResult;
      return `Nájdení zákazníci (${data.count}):\n${data.customers.map((c) => `- ${c.email || c.id} (Ciele: ${c.fitnessGoals?.join(', ') || 'N/A'})`).join('\n')}`;
    }
    default:
      return '';
  }
}

export async function POST(request: Request) {
  try {
    const { command, tool_calls: providedToolCalls } = await request.json();

    let toolCalls: ToolCall[] = providedToolCalls || [];

    if (toolCalls.length === 0) {
      toolCalls = parseToolCalls(command);

      if (toolCalls.length === 0) {
        const lowerCommand = String(command ?? '').toLowerCase();

        if (lowerCommand.includes('vyhľadaj') || lowerCommand.includes('nájdite') || lowerCommand.includes('search')) {
          const query = String(command).replace(/^(vyhľadaj|nájdite|search|find|hľadaj)\s+/i, '');
          toolCalls = [{
            id: `call_${Date.now()}`,
            type: 'function',
            function: {
              name: 'search_products',
              arguments: JSON.stringify({ query }),
            },
          }];
        }

        if (lowerCommand.includes('zvyš') || lowerCommand.includes('zníž') || lowerCommand.includes('nastav sklad')) {
          toolCalls = [{
            id: `call_${Date.now()}`,
            type: 'function',
            function: {
              name: 'update_inventory',
              arguments: JSON.stringify({
                product_id: 'placeholder',
                quantity: 0,
              }),
            },
          }];
        }

        if (lowerCommand.includes('vygeneruj') || lowerCommand.includes('marketing')) {
          toolCalls = [{
            id: `call_${Date.now()}`,
            type: 'function',
            function: {
              name: 'generate_marketing_copy',
              arguments: JSON.stringify({
                product_id: 'placeholder',
                channel: 'instagram',
              }),
            },
          }];
        }

        if (lowerCommand.includes('analyzuj') || lowerCommand.includes('predaje') || lowerCommand.includes('sales')) {
          toolCalls = [{
            id: `call_${Date.now()}`,
            type: 'function',
            function: {
              name: 'analyze_sales',
              arguments: JSON.stringify({ period: '30 days' }),
            },
          }];
        }

        if (lowerCommand.includes('zákazník') || lowerCommand.includes('customer') || lowerCommand.includes('crm')) {
          toolCalls = [{
            id: `call_${Date.now()}`,
            type: 'function',
            function: {
              name: 'query_firebase_customers',
              arguments: JSON.stringify({ filter: {} }),
            },
          }];
        }
      }
    }

    const toolResults: ToolResult[] = [];
    let finalResponse = '';

    for (const call of toolCalls) {
      try {
        const tool = TOOLS[call.function.name];
        if (!tool) {
          throw new Error(`Nástroj ${call.function.name} neexistuje`);
        }

        const args = parseArguments(call.function.arguments);
        const result = await tool(args);

        toolResults.push({
          id: call.id,
          type: 'function',
          function: {
            name: call.function.name,
            arguments: args,
            result,
          },
        });

        finalResponse = formatToolResponse(call.function.name, result);
      } catch (error) {
        toolResults.push({
          id: call.id,
          type: 'function',
          function: {
            name: call.function.name,
            arguments: call.function.arguments,
            result: { error: error instanceof Error ? error.message : String(error) },
          },
        });
        finalResponse = `Chyba pri spracovaní príkazu: ${error instanceof Error ? error.message : String(error)}`;
      }
    }

    if (toolResults.length === 0 && command) {
      finalResponse = `Nerozumiem príkazu: "${command}". Skúste napr.: "Vyhľadaj collagen", "Analyzuj predaje", alebo "Ktorí zákazníci majú cieľ regenerácia?"`;
    }

    return NextResponse.json({
      success: true,
      message: finalResponse,
      tool_calls: toolCalls,
      tool_results: toolResults,
    });
  } catch (error) {
    console.error('AI Command error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Chyba pri spracovaní príkazu',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
