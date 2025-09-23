import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  console.log('sync-inventory-shopify function called');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting function execution...');
    
    // Get Shopify credentials
    const storeDomain = Deno.env.get('SHOPIFY_STORE_DOMAIN');
    const storefrontToken = Deno.env.get('SHOPIFY_STOREFRONT_TOKEN');
    const apiVersion = Deno.env.get('SHOPIFY_STOREFRONT_API_VERSION');

    console.log('Shopify config check:', {
      storeDomain: !!storeDomain,
      storefrontToken: !!storefrontToken,
      apiVersion: !!apiVersion
    });

    if (!storeDomain || !storefrontToken || !apiVersion) {
      throw new Error(`Missing Shopify configuration: domain=${!!storeDomain}, token=${!!storefrontToken}, version=${!!apiVersion}`);
    }

    // Simple GraphQL query to get Shopify products
    const query = `
      query GetProducts {
        products(first: 10) {
          edges {
            node {
              id
              title
              description
              handle
              featuredImage {
                url
                altText
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    availableForSale
                  }
                }
              }
            }
          }
        }
      }
    `;

    console.log('Making Shopify API request...');
    const shopifyUrl = `https://${storeDomain}/api/${apiVersion}/graphql.json`;
    
    const response = await fetch(shopifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontToken,
      },
      body: JSON.stringify({ query }),
    });

    console.log('Shopify response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Shopify API error:', response.status, errorText);
      throw new Error(`Shopify API error: ${response.status} - ${errorText}`);
    }

    const shopifyData = await response.json();
    console.log('Shopify data received:', shopifyData);

    if (shopifyData.errors) {
      console.error('GraphQL errors:', shopifyData.errors);
      throw new Error(`GraphQL errors: ${JSON.stringify(shopifyData.errors)}`);
    }

    const shopifyProducts = shopifyData.data?.products?.edges?.map((edge: any) => edge.node) || [];
    console.log('Found products:', shopifyProducts.length);

    // Return simplified response for now
    return new Response(JSON.stringify({ 
      success: true,
      products: shopifyProducts,
      count: shopifyProducts.length,
      message: 'Shopify products fetched successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in sync-inventory-shopify:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack,
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});