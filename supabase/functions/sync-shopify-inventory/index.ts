import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting Shopify inventory sync...');

    // Get Shopify credentials from environment
    const shopifyDomain = Deno.env.get('SHOPIFY_STORE_DOMAIN');
    const storefrontToken = Deno.env.get('SHOPIFY_STOREFRONT_TOKEN');
    const apiVersion = Deno.env.get('SHOPIFY_STOREFRONT_API_VERSION') || '2024-01';

    if (!shopifyDomain || !storefrontToken) {
      throw new Error('Missing Shopify credentials');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // GraphQL query to fetch products from Shopify
    const query = `
      query getProducts($first: Int!, $after: String) {
        products(first: $first, after: $after) {
          edges {
            node {
              id
              title
              handle
              description
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
                    inventoryQuantity
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

    let allProducts: any[] = [];
    let hasNextPage = true;
    let cursor = null;

    // Fetch all products with pagination
    while (hasNextPage) {
      const variables = {
        first: 50,
        after: cursor
      };

      const response = await fetch(`https://${shopifyDomain}/api/${apiVersion}/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': storefrontToken,
        },
        body: JSON.stringify({ query, variables }),
      });

      if (!response.ok) {
        throw new Error(`Shopify API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(`Shopify GraphQL errors: ${JSON.stringify(data.errors)}`);
      }

      const products = data.data?.products?.edges || [];
      allProducts = allProducts.concat(products);

      hasNextPage = data.data?.products?.pageInfo?.hasNextPage || false;
      cursor = data.data?.products?.pageInfo?.endCursor;

      console.log(`Fetched ${products.length} products, total: ${allProducts.length}`);
    }

    console.log(`Total products fetched from Shopify: ${allProducts.length}`);

    // Process and sync products to Supabase inventory table
    let synced = 0;
    let errors = 0;

    for (const edge of allProducts) {
      const product = edge.node;
      
      try {
        // Get the first variant for pricing and stock
        const firstVariant = product.variants.edges[0]?.node;
        if (!firstVariant) continue;

        // Prepare inventory data
        const inventoryData = {
          name: product.title,
          category: product.productType || 'General',
          description: product.description,
          price: parseFloat(firstVariant.price.amount),
          stock: firstVariant.inventoryQuantity || 0,
          image: product.featuredImage?.url,
          skin_types: product.tags || [],
          rating: 4.5, // Default rating
        };

        // Check if product already exists in inventory
        const { data: existingProduct, error: selectError } = await supabase
          .from('inventory')
          .select('id')
          .eq('name', product.title)
          .single();

        if (selectError && selectError.code !== 'PGRST116') {
          console.error('Error checking existing product:', selectError);
          errors++;
          continue;
        }

        if (existingProduct) {
          // Update existing product
          const { error: updateError } = await supabase
            .from('inventory')
            .update(inventoryData)
            .eq('id', existingProduct.id);

          if (updateError) {
            console.error('Error updating product:', updateError);
            errors++;
          } else {
            synced++;
          }
        } else {
          // Insert new product
          const { error: insertError } = await supabase
            .from('inventory')
            .insert(inventoryData);

          if (insertError) {
            console.error('Error inserting product:', insertError);
            errors++;
          } else {
            synced++;
          }
        }
      } catch (error) {
        console.error('Error processing product:', product.title, error);
        errors++;
      }
    }

    console.log(`Sync completed: ${synced} synced, ${errors} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Inventory sync completed successfully`,
        stats: {
          totalFetched: allProducts.length,
          synced: synced,
          errors: errors
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Sync error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});