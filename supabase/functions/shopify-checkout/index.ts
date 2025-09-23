import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    console.log('Received checkout request:', body);
    
    // Support both single variant and multiple line items for cart
    let lineItems;
    if (body.lineItems && Array.isArray(body.lineItems)) {
      // Multiple items from cart
      lineItems = body.lineItems.map((item: any) => ({
        merchandiseId: item.variantId,
        quantity: item.quantity || 1
      }));
    } else if (body.variantId) {
      // Single item (legacy support)
      lineItems = [{
        merchandiseId: body.variantId,
        quantity: body.quantity || 1
      }];
    } else {
      throw new Error('Either variantId or lineItems is required');
    }

    const storeDomain = 'ddfab1-q0.myshopify.com';
    const storefrontToken = '6e106be342d15e7e7462dee0fcc00c41';
    const apiVersion = '2024-01';

    console.log('Creating checkout for:', { lineItems });

    if (!storeDomain || !storefrontToken || !apiVersion) {
      throw new Error('Missing Shopify configuration');
    }

    const mutation = `
      mutation CreateCart($lines: [CartLineInput!]!) {
        cartCreate(input: { lines: $lines }) {
          cart {
            id
            checkoutUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      lines: lineItems
    };

    // Ensure proper domain format - remove trailing slash and add .myshopify.com if not present
    let normalizedDomain = storeDomain.replace(/\/$/, ''); // Remove trailing slash
    if (!normalizedDomain.includes('.myshopify.com')) {
      normalizedDomain = `${normalizedDomain}.myshopify.com`;
    }
    
    const shopifyUrl = `https://${normalizedDomain}/api/${apiVersion}/graphql.json`;
    
    console.log('Making checkout request to Shopify:', shopifyUrl);

    const response = await fetch(shopifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontToken,
      },
      body: JSON.stringify({ query: mutation, variables }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Shopify API error:', response.status, errorText);
      throw new Error(`Shopify API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Shopify checkout response:', data);

    if (data.data?.cartCreate?.userErrors?.length > 0) {
      throw new Error(data.data.cartCreate.userErrors[0].message);
    }

    const checkoutUrl = data.data?.cartCreate?.cart?.checkoutUrl;
    
    if (!checkoutUrl) {
      throw new Error('Failed to create checkout');
    }

    return new Response(JSON.stringify({ checkoutUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error creating checkout:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});