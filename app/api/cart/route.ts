import { NextRequest, NextResponse } from 'next/server';
import {
  addToCart,
  createCart,
  getCart,
  removeCartLine,
  updateCartLine,
} from '@/app/lib/shopify-cart';

export async function GET(request: NextRequest) {
  const cartId = request.nextUrl.searchParams.get('cartId');
  if (!cartId) {
    return NextResponse.json({ error: 'cartId required' }, { status: 400 });
  }
  const cart = await getCart(cartId);
  if (!cart) {
    return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
  }
  return NextResponse.json(cart);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, cartId, merchandiseId, quantity, lineId } = body;

    if (action === 'create') {
      const cart = await createCart();
      return NextResponse.json(cart);
    }

    if (!cartId) {
      return NextResponse.json({ error: 'cartId required' }, { status: 400 });
    }

    if (action === 'add') {
      const cart = await addToCart(cartId, merchandiseId, quantity ?? 1);
      return NextResponse.json(cart);
    }

    if (action === 'update') {
      const cart = await updateCartLine(cartId, lineId, quantity ?? 1);
      return NextResponse.json(cart);
    }

    if (action === 'remove') {
      const cart = await removeCartLine(cartId, lineId);
      return NextResponse.json(cart);
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Cart API error:', error);
    return NextResponse.json({ error: 'Cart operation failed' }, { status: 500 });
  }
}
