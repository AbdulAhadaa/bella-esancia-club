-- Add Shopify variant ID to inventory for checkout integration
ALTER TABLE public.inventory 
ADD COLUMN shopify_variant_id text,
ADD COLUMN shopify_product_id text;