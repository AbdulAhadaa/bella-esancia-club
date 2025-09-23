import { supabase } from "@/integrations/supabase/client";

export interface StorefrontProduct {
  id: string;
  handle: string;
  title: string;
  vendor: string;
  productType: string;
  tags: string[];
  description: string;
  featuredImage?: {
    url: string;
    altText: string;
  };
  images: {
    edges: Array<{
      node: {
        url: string;
        altText: string;
      };
    }>;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        availableForSale: boolean;
        quantityAvailable: number;
        price: {
          amount: string;
          currencyCode: string;
        };
      };
    }>;
  };
}

export interface StorefrontCart {
  id: string;
  checkoutUrl: string;
  lines: {
    edges: Array<{
      node: {
        id: string;
        quantity: number;
        merchandise: {
          id: string;
          title: string;
          product: {
            id: string;
            title: string;
            vendor: string;
            featuredImage?: {
              url: string;
              altText: string;
            };
          };
          price: {
            amount: string;
            currencyCode: string;
          };
        };
      };
    }>;
  };
  cost: {
    subtotalAmount: {
      amount: string;
      currencyCode: string;
    };
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
  };
}

export interface Collection {
  id: string;
  handle: string;
  title: string;
  description: string;
}

async function callStorefrontFunction(action: string, params: any = {}) {
  try {
    const { data, error } = await supabase.functions.invoke('shopify-storefront', {
      body: { action, ...params }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Failed to call storefront: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data received from storefront');
    }

    return data;
  } catch (error) {
    console.error('Error calling storefront function:', error);
    throw error;
  }
}

export async function getProducts(params: {
  first?: number;
  after?: string;
  query?: string;
  vendor?: string;
  productType?: string;
  tags?: string[];
} = {}): Promise<{ products: StorefrontProduct[]; pageInfo: any }> {
  const result = await callStorefrontFunction('getProducts', params);
  
  if (!result.data?.products?.edges) {
    throw new Error('Invalid products response structure');
  }

  return {
    products: result.data.products.edges.map((edge: any) => edge.node),
    pageInfo: result.data.products.pageInfo
  };
}

export async function getProduct(handle: string): Promise<StorefrontProduct | null> {
  const result = await callStorefrontFunction('getProduct', { handle });
  
  if (!result.data?.productByHandle) {
    return null;
  }

  return result.data.productByHandle;
}

export async function getCollections(): Promise<Collection[]> {
  const result = await callStorefrontFunction('getCollections');
  
  if (!result.data?.collections?.edges) {
    throw new Error('Invalid collections response structure');
  }

  return result.data.collections.edges.map((edge: any) => edge.node);
}

export async function getCollectionProducts(handle: string, params: {
  first?: number;
  after?: string;
} = {}): Promise<{ products: StorefrontProduct[]; pageInfo: any; collection: Collection }> {
  const result = await callStorefrontFunction('getCollectionProducts', { handle, ...params });
  
  if (!result.data?.collectionByHandle) {
    throw new Error('Collection not found');
  }

  const collection = result.data.collectionByHandle;
  
  return {
    collection: {
      id: collection.id,
      handle: collection.handle || handle,
      title: collection.title,
      description: collection.description || ''
    },
    products: collection.products.edges.map((edge: any) => edge.node),
    pageInfo: collection.products.pageInfo
  };
}

// Cart functions
export async function createCart(lines: Array<{ merchandiseId: string; quantity: number }> = []): Promise<StorefrontCart> {
  const result = await callStorefrontFunction('createCart', { lines });
  
  if (result.data?.cartCreate?.userErrors?.length > 0) {
    throw new Error(result.data.cartCreate.userErrors[0].message);
  }

  if (!result.data?.cartCreate?.cart) {
    throw new Error('Failed to create cart');
  }

  return result.data.cartCreate.cart;
}

export async function getCart(cartId: string): Promise<StorefrontCart | null> {
  try {
    const result = await callStorefrontFunction('getCart', { cartId });
    return result.data?.cart || null;
  } catch (error) {
    console.error('Error getting cart:', error);
    return null;
  }
}

export async function addToCart(cartId: string, lines: Array<{ merchandiseId: string; quantity: number }>): Promise<StorefrontCart> {
  const result = await callStorefrontFunction('addToCart', { cartId, lines });
  
  if (result.data?.cartLinesAdd?.userErrors?.length > 0) {
    throw new Error(result.data.cartLinesAdd.userErrors[0].message);
  }

  if (!result.data?.cartLinesAdd?.cart) {
    throw new Error('Failed to add to cart');
  }

  return result.data.cartLinesAdd.cart;
}

export async function updateCartLines(cartId: string, lines: Array<{ id: string; quantity: number }>): Promise<StorefrontCart> {
  const result = await callStorefrontFunction('updateCartLines', { cartId, lines });
  
  if (result.data?.cartLinesUpdate?.userErrors?.length > 0) {
    throw new Error(result.data.cartLinesUpdate.userErrors[0].message);
  }

  if (!result.data?.cartLinesUpdate?.cart) {
    throw new Error('Failed to update cart');
  }

  return result.data.cartLinesUpdate.cart;
}

export async function removeFromCart(cartId: string, lineIds: string[]): Promise<StorefrontCart> {
  const result = await callStorefrontFunction('removeFromCart', { cartId, lineIds });
  
  if (result.data?.cartLinesRemove?.userErrors?.length > 0) {
    throw new Error(result.data.cartLinesRemove.userErrors[0].message);
  }

  if (!result.data?.cartLinesRemove?.cart) {
    throw new Error('Failed to remove from cart');
  }

  return result.data.cartLinesRemove.cart;
}

export async function getRecommendedProducts(productId: string, intent: 'RELATED' | 'COMPLEMENTARY' = 'RELATED'): Promise<StorefrontProduct[]> {
  try {
    const result = await callStorefrontFunction('getRecommendedProducts', { productId, intent });
    return result.data?.productRecommendations || [];
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return [];
  }
}

export function formatPrice(amount: string, currencyCode: string = 'USD'): string {
  const price = parseFloat(amount);
  
  if (currencyCode === 'USD') {
    // Convert USD to COP (approximate rate)
    const copAmount = price * 4000;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(copAmount);
  }
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currencyCode,
  }).format(price);
}