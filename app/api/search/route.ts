import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/app/lib/shopify';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    const products = await searchProducts(query, 8);
    const results = products.map((product) => ({
      id: product.id,
      label: product.title,
      href: `/produkty/${product.handle}`,
    }));
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
