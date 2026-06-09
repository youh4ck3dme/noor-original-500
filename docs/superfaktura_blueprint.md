# Blueprint: Shopify to SuperFaktúra Webhook Integration

This blueprint details how to implement an automated invoicing connector between Shopify and SuperFaktúra within a Next.js App Router project (like `/Users/erikbabcan/noor-original-500`), optimized for the Slovak market and fully compliant with the official SuperFaktúra API specification.

---

## 1. Environment Variables (`.env.local`)

Add the following credentials to your `.env.local` file:

```env
# SuperFaktúra Configuration
SUPERFAKTURA_EMAIL="your-superfaktura-email@domain.com"
SUPERFAKTURA_API_KEY="your-superfaktura-api-key"
SUPERFAKTURA_COMPANY_ID="your-superfaktura-company-id" # Optional if only using one company

# Shopify Webhook Security
SHOPIFY_WEBHOOK_SECRET="your-shopify-webhook-signing-secret"
```

> [!NOTE]
> You can retrieve the `SHOPIFY_WEBHOOK_SECRET` from the Shopify Admin panel after creating the webhook (displayed at the bottom of the Notifications page).

---

## 2. API Route Implementation

Create the file `app/api/superfaktura/route.ts` with the following implementation. It verifies the Shopify signature, extracts order details, maps line items, and creates a paid invoice in SuperFaktúra.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';

// Helper to verify Shopify Webhook signature
function verifyShopifySignature(rawBody: string, hmacHeader: string | null): boolean {
  if (!hmacHeader) return false;
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) {
    console.error('Missing SHOPIFY_WEBHOOK_SECRET environment variable.');
    return false;
  }
  const hash = crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('base64');
  return hash === hmacHeader;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const hmacHeader = req.headers.get('x-shopify-hmac-sha256');

    // 1. Security check: Validate the webhook origin
    if (!verifyShopifySignature(rawBody, hmacHeader)) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized signature' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const order = JSON.parse(rawBody);

    // 2. Validate Shopify payload (Check if order is paid)
    if (order.financial_status !== 'paid') {
      return NextResponse.json({ message: 'Order is not paid yet, skipping invoice generation.' });
    }

    // 3. Map Shopify line items to SuperFaktúra items format
    const invoiceItems = order.line_items.map((item: any) => ({
      name: item.name,
      description: item.variant_title || '',
      quantity: item.quantity,
      unit: 'ks',
      unit_price: parseFloat(item.price),
      tax: item.tax_lines && item.tax_lines.length > 0 ? parseFloat(item.tax_lines[0].rate) * 100 : 20, // default 20% DPH
    }));

    // 4. Map Customer Details
    const customer = {
      name: order.billing_address 
        ? `${order.billing_address.first_name} ${order.billing_address.last_name}`
        : `${order.customer.first_name} ${order.customer.last_name}`,
      email: order.email || order.customer.email,
      phone: order.billing_address?.phone || order.customer?.phone || '',
      address: order.billing_address?.address1 || '',
      city: order.billing_address?.city || '',
      zip: order.billing_address?.zip || '',
      country: order.billing_address?.country || 'Slovensko',
    };

    // 5. Construct SuperFaktúra API payload (Slovak Market Optimized)
    const superfakturaPayload = {
      Invoice: {
        name: `Faktúra k objednávke #${order.order_number}`,
        invoice_type: 'regular',
        payment_type: 'transfer', // default payment type (bankový prevod / platobná brána)
        status: 'paid', // Mark invoice as PAID immediately since Shopify order is paid
        
        // Critical fields for Slovak billing and bank pairing:
        variable_symbol: order.order_number, // Matches Shopify order number for bank API pairing
        constant_symbol: '0008', // Default for goods & services
        currency: order.currency || 'EUR', // Ensures currency matches Shopify store
      },
      Client: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        zip: customer.zip,
        country: customer.country,
      },
      InvoiceItem: invoiceItems,
    };

    // 6. Build SuperFaktúra Authorization Header
    // Specification: SFAPI email=EMAIL&apikey=APIKEY&company_id=COMPANYID
    const email = process.env.SUPERFAKTURA_EMAIL;
    const apiKey = process.env.SUPERFAKTURA_API_KEY;
    const companyId = process.env.SUPERFAKTURA_COMPANY_ID;
    
    let authHeader = `SFAPI email=${email}&apikey=${apiKey}`;
    if (companyId) {
      authHeader += `&company_id=${companyId}`;
    }

    // 7. Send request to SuperFaktúra API (Form URL-Encoded format)
    // Note: The API expects Content-Type: application/x-www-form-urlencoded with data parameter
    const sfResponse = await fetch('https://moja.superfaktura.sk/invoices/create', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: `data=${encodeURIComponent(JSON.stringify(superfakturaPayload))}`,
    });

    if (!sfResponse.ok) {
      const errorText = await sfResponse.text();
      console.error('SuperFaktura API Error:', errorText);
      return NextResponse.json(
        { error: 'Failed to create invoice in SuperFaktúra', details: errorText },
        { status: 502 }
      );
    }

    const sfData = await sfResponse.json();

    // 8. Send the invoice PDF to the customer via Email
    if (sfData.data?.Invoice?.id) {
      const invoiceId = sfData.data.Invoice.id;
      const emailPayload = {
        Email: {
          invoice_id: invoiceId,
          to: customer.email,
          subject: `Faktúra k objednávke #${order.order_number}`,
        },
      };

      await fetch('https://moja.superfaktura.sk/invoices/postEmail', {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: `data=${encodeURIComponent(JSON.stringify(emailPayload))}`,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Invoice created and queued for delivery successfully.',
      invoiceId: sfData.data?.Invoice?.id || null,
    });

  } catch (error: any) {
    console.error('Error handling superfaktura webhook:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```
