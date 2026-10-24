import { NextResponse } from 'next/server';
import { requireAdmin } from '@/app/lib/api-auth';
import type { OptimizationApplyPayload } from '@/app/lib/product-optimization';
import { shopifyAdminFetch } from '@/app/lib/shopify-admin';

const productUpdateMutation = `
  mutation productUpdate($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
        handle
      }
      userErrors {
        field
        message
      }
    }
  }
`;

interface ApplyOptimizationBody {
  productId: string;
  productHandle: string;
  applyPayload: OptimizationApplyPayload;
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return auth.error;
  }

  try {
    const body = (await request.json()) as ApplyOptimizationBody;
    const { productId, productHandle, applyPayload } = body;

    if (!productId || !productHandle || !applyPayload) {
      return NextResponse.json(
        { error: 'Missing productId, productHandle, or applyPayload' },
        { status: 400 },
      );
    }

    const metafields = applyPayload.metafields.map((field) => ({
      namespace: field.namespace,
      key: field.key,
      type: field.type,
      value: field.value,
    }));

    const response = await shopifyAdminFetch<{
      productUpdate: {
        product: { id: string; handle: string } | null;
        userErrors: Array<{ field: string[]; message: string }>;
      };
    }>(productUpdateMutation, {
      input: {
        id: productId,
        seo: {
          title: applyPayload.seo.title,
          description: applyPayload.seo.description,
        },
        metafields,
      },
    });

    const userErrors = response.productUpdate.userErrors;
    if (userErrors.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Shopify rejected the update', userErrors },
        { status: 422 },
      );
    }

    return NextResponse.json({
      success: true,
      product: response.productUpdate.product,
    });
  } catch (error) {
    console.error('Failed to apply optimization:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to apply optimization',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
