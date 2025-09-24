import { fetchShopifyProductsDirect } from './shopify-direct';

// Auto-sync Shopify products every 5 minutes
let syncInterval: NodeJS.Timeout | null = null;

export function startAutoSync() {
  if (syncInterval) return;
  
  syncInterval = setInterval(async () => {
    try {
      await fetchShopifyProductsDirect();
      console.log('Auto-synced Shopify products');
    } catch (error) {
      console.error('Auto-sync failed:', error);
    }
  }, 5 * 60 * 1000); // 5 minutes
}

export function stopAutoSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}