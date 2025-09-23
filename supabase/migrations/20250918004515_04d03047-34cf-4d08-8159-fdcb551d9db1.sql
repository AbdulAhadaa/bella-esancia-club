-- Allow public access to view inventory products
DROP POLICY IF EXISTS "Public can view inventory" ON public.inventory;

CREATE POLICY "Public can view inventory" 
ON public.inventory 
FOR SELECT 
USING (true);