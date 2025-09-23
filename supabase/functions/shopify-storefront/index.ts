import { corsHeaders } from '../_shared/cors.ts';

interface CartLineInput {
  merchandiseId: string;
  quantity: number;
}

interface CartInput {
  lines: CartLineInput[];
}

const SHOPIFY_DOMAIN = Deno.env.get('SHOPIFY_DOMAIN') || 'nuabok.myshopify.com';
const SHOPIFY_STOREFRONT_TOKEN = Deno.env.get('SHOPIFY_STOREFRONT_ACCESS_TOKEN');

if (!SHOPIFY_STOREFRONT_TOKEN) {
  console.error('Missing SHOPIFY_STOREFRONT_ACCESS_TOKEN');
}

const STOREFRONT_API_VERSION = '2024-01';

async function shopifyStorefrontRequest(query: string, variables: any = {}) {
  const url = `https://${SHOPIFY_DOMAIN}/api/${STOREFRONT_API_VERSION}/graphql.json`;
  
  console.log('Making Shopify Storefront request:', { url, query: query.substring(0, 100) + '...' });
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN!,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    console.error('Shopify API error:', response.status, response.statusText);
    throw new Error(`Shopify API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.errors) {
    console.error('GraphQL errors:', data.errors);
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
  }

  return data;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    console.log('Received action:', action, 'with params:', params);

    switch (action) {
      case 'getProducts': {
        const { first = 20, after, query: searchQuery, vendor, productType, tags } = params;
        
        const filters = [];
        
        if (searchQuery) {
          filters.push(`title:*${searchQuery}*`);
        }
        if (vendor) {
          filters.push(`vendor:${vendor}`);
        }
        if (productType) {
          filters.push(`product_type:${productType}`);
        }
        if (tags && tags.length > 0) {
          filters.push(`tag:${tags.join(' OR tag:')}`);
        }
        
        let query;
        if (filters.length > 0) {
          const queryFilter = filters.join(' AND ');
          query = `
            query getProducts($first: Int!, $after: String, $query: String!) {
              products(first: $first, after: $after, query: $query) {`;
        } else {
          query = `
            query getProducts($first: Int!, $after: String) {
              products(first: $first, after: $after) {`;
        }
              edges {
                node {
                  id
                  handle
                  title
                  vendor
                  productType
                  tags
                  description
                  featuredImage {
                    url
                    altText
                  }
                  images(first: 5) {
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
                        availableForSale
                        quantityAvailable
                        price {
                          amount
                          currencyCode
                        }
                      }
                    }
                  }
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        `;

        const variables = filters.length > 0 
          ? { first, after, query: filters.join(' AND ') }
          : { first, after };
        const result = await shopifyStorefrontRequest(query, variables);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'getProduct': {
        const { handle } = params;
        
        const query = `
          query getProduct($handle: String!) {
            productByHandle(handle: $handle) {
              id
              handle
              title
              vendor
              productType
              tags
              description
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
              variants(first: 20) {
                edges {
                  node {
                    id
                    title
                    availableForSale
                    quantityAvailable
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        `;

        const result = await shopifyStorefrontRequest(query, { handle });
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'getCollections': {
        const query = `
          query getCollections {
            collections(first: 50) {
              edges {
                node {
                  id
                  handle
                  title
                  description
                }
              }
            }
          }
        `;

        const result = await shopifyStorefrontRequest(query);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'getCollectionProducts': {
        const { handle, first = 20, after } = params;
        
        const query = `
          query getCollectionProducts($handle: String!, $first: Int!, $after: String) {
            collectionByHandle(handle: $handle) {
              id
              title
              products(first: $first, after: $after) {
                edges {
                  node {
                    id
                    handle
                    title
                    vendor
                    productType
                    tags
                    featuredImage {
                      url
                      altText
                    }
                    variants(first: 1) {
                      edges {
                        node {
                          id
                          title
                          availableForSale
                          quantityAvailable
                          price {
                            amount
                            currencyCode
                          }
                        }
                      }
                    }
                  }
                }
                pageInfo {
                  hasNextPage
                  endCursor
                }
              }
            }
          }
        `;

        const result = await shopifyStorefrontRequest(query, { handle, first, after });
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'createCart': {
        const { lines = [] } = params;
        
        const query = `
          mutation cartCreate($input: CartInput!) {
            cartCreate(input: $input) {
              cart {
                id
                checkoutUrl
                lines(first: 100) {
                  edges {
                    node {
                      id
                      quantity
                      merchandise {
                        ... on ProductVariant {
                          id
                          title
                          product {
                            id
                            title
                            vendor
                            featuredImage {
                              url
                              altText
                            }
                          }
                          price {
                            amount
                            currencyCode
                          }
                        }
                      }
                    }
                  }
                }
                cost {
                  subtotalAmount {
                    amount
                    currencyCode
                  }
                  totalAmount {
                    amount
                    currencyCode
                  }
                }
              }
              userErrors {
                field
                message
              }
            }
          }
        `;

        const input: CartInput = { lines };
        const result = await shopifyStorefrontRequest(query, { input });
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'getCart': {
        const { cartId } = params;
        
        const query = `
          query getCart($cartId: ID!) {
            cart(id: $cartId) {
              id
              checkoutUrl
              lines(first: 100) {
                edges {
                  node {
                    id
                    quantity
                    merchandise {
                      ... on ProductVariant {
                        id
                        title
                        product {
                          id
                          title
                          vendor
                          featuredImage {
                            url
                            altText
                          }
                        }
                        price {
                          amount
                          currencyCode
                        }
                      }
                    }
                  }
                }
              }
              cost {
                subtotalAmount {
                  amount
                  currencyCode
                }
                totalAmount {
                  amount
                  currencyCode
                }
              }
            }
          }
        `;

        const result = await shopifyStorefrontRequest(query, { cartId });
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'addToCart': {
        const { cartId, lines } = params;
        
        const query = `
          mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
            cartLinesAdd(cartId: $cartId, lines: $lines) {
              cart {
                id
                checkoutUrl
                lines(first: 100) {
                  edges {
                    node {
                      id
                      quantity
                      merchandise {
                        ... on ProductVariant {
                          id
                          title
                          product {
                            id
                            title
                            vendor
                            featuredImage {
                              url
                              altText
                            }
                          }
                          price {
                            amount
                            currencyCode
                          }
                        }
                      }
                    }
                  }
                }
                cost {
                  subtotalAmount {
                    amount
                    currencyCode
                  }
                  totalAmount {
                    amount
                    currencyCode
                  }
                }
              }
              userErrors {
                field
                message
              }
            }
          }
        `;

        const result = await shopifyStorefrontRequest(query, { cartId, lines });
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'updateCartLines': {
        const { cartId, lines } = params;
        
        const query = `
          mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
            cartLinesUpdate(cartId: $cartId, lines: $lines) {
              cart {
                id
                checkoutUrl
                lines(first: 100) {
                  edges {
                    node {
                      id
                      quantity
                      merchandise {
                        ... on ProductVariant {
                          id
                          title
                          product {
                            id
                            title
                            vendor
                            featuredImage {
                              url
                              altText
                            }
                          }
                          price {
                            amount
                            currencyCode
                          }
                        }
                      }
                    }
                  }
                }
                cost {
                  subtotalAmount {
                    amount
                    currencyCode
                  }
                  totalAmount {
                    amount
                    currencyCode
                  }
                }
              }
              userErrors {
                field
                message
              }
            }
          }
        `;

        const result = await shopifyStorefrontRequest(query, { cartId, lines });
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'removeFromCart': {
        const { cartId, lineIds } = params;
        
        const query = `
          mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
            cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
              cart {
                id
                checkoutUrl
                lines(first: 100) {
                  edges {
                    node {
                      id
                      quantity
                      merchandise {
                        ... on ProductVariant {
                          id
                          title
                          product {
                            id
                            title
                            vendor
                            featuredImage {
                              url
                              altText
                            }
                          }
                          price {
                            amount
                            currencyCode
                          }
                        }
                      }
                    }
                  }
                }
                cost {
                  subtotalAmount {
                    amount
                    currencyCode
                  }
                  totalAmount {
                    amount
                    currencyCode
                  }
                }
              }
              userErrors {
                field
                message
              }
            }
          }
        `;

        const result = await shopifyStorefrontRequest(query, { cartId, lineIds });
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'getRecommendedProducts': {
        const { productId, intent = 'RELATED' } = params;
        
        const query = `
          query getRecommendedProducts($productId: ID!, $intent: ProductRecommendationIntent!) {
            productRecommendations(productId: $productId, intent: $intent) {
              id
              handle
              title
              vendor
              productType
              featuredImage {
                url
                altText
              }
              variants(first: 1) {
                edges {
                  node {
                    id
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
        `;

        const result = await shopifyStorefrontRequest(query, { productId, intent });
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Error in shopify-storefront function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});