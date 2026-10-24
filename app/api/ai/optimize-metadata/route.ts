import { NextResponse } from 'next/server';
import { requireAdmin } from '@/app/lib/api-auth';
import { buildOptimizationResult } from '@/app/lib/product-optimization';
import { getProducts, getProductByHandle } from '@/app/lib/shopify';

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return auth.error;
  }

  try {
    const { productId, productHandle } = await request.json();

    let product;
    if (productId) {
      const products = await getProducts(100);
      product = products.find((p) => {
        if (p.id === productId) {
          return true;
        }
        const firstVariantId = p.variants?.edges[0]?.node?.id;
        return firstVariantId === productId;
      });
    } else if (productHandle) {
      product = await getProductByHandle(productHandle);
    }

    if (!product) {
      return NextResponse.json({ error: 'Produkt nebol nájdený' }, { status: 404 });
    }

    const result = buildOptimizationResult(product);

    return NextResponse.json({
      success: true,
      message: `Optimalizácia metaobjektov pre ${product.title} úspešná`,
      data: result,
    });
  } catch (error) {
    console.error('AI Optimization error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'AI Optimalizácia zlyhala',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
