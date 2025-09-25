import { fetchShopifyProductsDirect } from "./shopify-direct";

// Hardcoded categories based on your Shopify store
const SHOPIFY_CATEGORIES = [
  { name: 'Sunscreen', slug: 'sunscreen', count: 1 },
  { name: 'Eye Creams', slug: 'eye-creams', count: 1 },
  { name: 'Facial Cleansers', slug: 'facial-cleansers', count: 1 }
];

export interface DynamicCategory {
  name: string;
  slug: string;
  count: number;
}

export async function getDynamicCategories(): Promise<DynamicCategory[]> {
  try {
    // Return hardcoded categories for now since Shopify API doesn't expose the Category field
    return SHOPIFY_CATEGORIES;
  } catch (error) {
    console.error('Error fetching dynamic categories:', error);
    return SHOPIFY_CATEGORIES;
  }
}