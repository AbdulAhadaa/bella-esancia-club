// Direct Shopify API calls without Supabase edge functions
const SHOPIFY_DOMAIN = 'ddfab1-q0.myshopify.com';
const SHOPIFY_STOREFRONT_TOKEN = '6e106be342d15e7e7462dee0fcc00c41';
const API_VERSION = '2024-01';

async function shopifyRequest(query: string, variables: any = {}) {
  const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
  }

  return data;
}

export async function fetchShopifyProductsDirect() {
  const query = `
    query getProducts($first: Int!) {
      products(first: $first) {
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

  const result = await shopifyRequest(query, { first: 20 });
  return result.data.products.edges.map((edge: any) => edge.node);
}

export async function createShopifyCheckoutDirect(lineItems: Array<{ variantId: string; quantity: number }>) {
  const query = `
    mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) {
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

  const input = {
    lines: lineItems.map(item => ({
      merchandiseId: item.variantId,
      quantity: item.quantity
    }))
  };

  const result = await shopifyRequest(query, { input });
  
  if (result.data.cartCreate.userErrors.length > 0) {
    throw new Error(result.data.cartCreate.userErrors[0].message);
  }

  return result.data.cartCreate.cart.checkoutUrl;
}