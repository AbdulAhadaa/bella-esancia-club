import { supabase } from "@/integrations/supabase/client";

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  vendor: string;
  productType: string;
  tags: string[];
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
        price: {
          amount: string;
          currencyCode: string;
        };
        availableForSale: boolean;
      };
    }>;
  };
}

export interface CartLineItem {
  variantId: string;
  quantity: number;
}

export async function fetchShopifyProducts(): Promise<ShopifyProduct[]> {
  try {
    console.log('Fetching products from Shopify...');
    
    const { data, error } = await supabase.functions.invoke('shopify-products');
    
    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    if (!data?.data?.products?.edges) {
      console.error('Unexpected response structure:', data);
      throw new Error('Invalid response structure from Shopify');
    }

    const products = data.data.products.edges.map((edge: any) => edge.node);
    console.log(`Successfully fetched ${products.length} products`);
    
    return products;
  } catch (error) {
    console.error('Error fetching Shopify products:', error);
    throw error;
  }
}

export async function createShopifyCheckout(lineItems: CartLineItem[]): Promise<string> {
  try {
    console.log('Creating Shopify checkout for items:', lineItems);
    
    const { data, error } = await supabase.functions.invoke('shopify-checkout', {
      body: { lineItems }
    });
    
    if (error) {
      console.error('Shopify checkout error:', error);
      // Fallback: Return demo checkout URL
      console.log('Using demo checkout fallback');
      return 'https://ddfab1-q0.myshopify.com/cart';
    }

    if (data?.error) {
      console.error('Shopify function returned error:', data.error);
      // Fallback: Return demo checkout URL
      console.log('Using demo checkout fallback');
      return 'https://ddfab1-q0.myshopify.com/cart';
    }

    if (!data?.checkoutUrl) {
      console.error('No checkout URL in response:', data);
      // Fallback: Return demo checkout URL
      console.log('Using demo checkout fallback');
      return 'https://ddfab1-q0.myshopify.com/cart';
    }

    console.log('Successfully created checkout:', data.checkoutUrl);
    return data.checkoutUrl;
  } catch (error) {
    console.error('Error creating Shopify checkout:', error);
    // Fallback: Return demo checkout URL
    console.log('Using demo checkout fallback');
    return 'https://ddfab1-q0.myshopify.com/cart';
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
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(price);
}