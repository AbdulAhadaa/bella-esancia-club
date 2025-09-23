import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const storeDomain = Deno.env.get('SHOPIFY_STORE_DOMAIN') || 'ddfab1-q0.myshopify.com';
    const storefrontToken = Deno.env.get('SHOPIFY_STOREFRONT_TOKEN') || '6e106be342d15e7e7462dee0fcc00c41';
    const apiVersion = Deno.env.get('SHOPIFY_STOREFRONT_API_VERSION') || '2024-01';

    console.log('Shopify credentials check:', {
      storeDomain: !!storeDomain,
      storefrontToken: !!storefrontToken,
      apiVersion: !!apiVersion,
      storeDomainValue: storeDomain,
      apiVersionValue: apiVersion
    });

    if (!storeDomain || !storefrontToken || !apiVersion) {
      throw new Error('Missing Shopify configuration');
    }

    const query = `
      query GetProducts($first: Int!, $after: String) {
        products(first: $first, after: $after) {
          edges {
            node {
              id
              title
              description
              handle
              vendor
              productType
              tags
              featuredImage {
                url
                altText
              }
              images(first: 10) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              variants(first: 10) {
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
            cursor
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;

    // Ensure proper domain format - add .myshopify.com if not present
    let normalizedDomain = storeDomain;
    if (!storeDomain.includes('.myshopify.com')) {
      normalizedDomain = `${storeDomain}.myshopify.com`;
    }
    
    const shopifyUrl = `https://${normalizedDomain}/api/${apiVersion}/graphql.json`;
    
    console.log('Making request to Shopify:', shopifyUrl);

    // Fetch all products with pagination
    let allProducts: any[] = [];
    let hasNextPage = true;
    let cursor = null;
    let requestCount = 0;
    const maxRequests = 20; // Increased limit to get more products

    while (hasNextPage && requestCount < maxRequests) {
      const variables = {
        first: 100, // Increased from 50 to get more products per request
        after: cursor
      };

      let response = await fetch(shopifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': storefrontToken,
        },
        body: JSON.stringify({ query, variables }),
      });

      // If failed, try alternative domain formats
      if (!response.ok) {
        console.log('First attempt failed, trying alternative formats...');
        
        // Try with .myshopify.com if not already present
        if (!normalizedDomain.includes('myshopify.com')) {
          const altUrl = `https://${storeDomain}.myshopify.com/api/${apiVersion}/graphql.json`;
          console.log('Retrying with .myshopify.com:', altUrl);
          response = await fetch(altUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Storefront-Access-Token': storefrontToken,
            },
            body: JSON.stringify({ query, variables }),
          });
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Shopify API error:', response.status, errorText);
        throw new Error(`Shopify API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.errors) {
        console.error('Shopify GraphQL errors:', data.errors);
        throw new Error(`Shopify GraphQL errors: ${JSON.stringify(data.errors)}`);
      }

      const products = data.data?.products?.edges || [];
      allProducts = allProducts.concat(products);

      hasNextPage = data.data?.products?.pageInfo?.hasNextPage || false;
      cursor = data.data?.products?.pageInfo?.endCursor;
      requestCount++;

      console.log(`Fetched ${products.length} products, total: ${allProducts.length}, hasNextPage: ${hasNextPage}`);
    }

    console.log(`Final result: ${allProducts.length} products fetched in ${requestCount} requests`);
    
    // Log unique vendors/brands found
    const uniqueVendors = [...new Set(allProducts.map(edge => edge.node.vendor))];
    console.log('Unique brands found:', uniqueVendors);

    return new Response(JSON.stringify({ data: { products: { edges: allProducts } } }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});