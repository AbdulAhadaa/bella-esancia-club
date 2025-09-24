import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { fetchShopifyProductsDirect } from "@/lib/shopify-direct";
import { CATEGORIES } from "@/types/shopify";

interface Product {
  id: string;
  name?: string;
  title?: string;
  category?: string;
  price?: number;
  image?: string;
  featuredImage?: {
    url: string;
    altText: string;
  };
  variants?: Array<{
    price: {
      amount: string;
      currencyCode: string;
    };
  }>;
}

interface ProductsMenuProps {
  category: string;
  onAddToCart: (product: Product) => void;
}

const ProductsMenu = ({ category, onAddToCart }: ProductsMenuProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductsByCategory();
  }, [category]);

  const fetchProductsByCategory = async () => {
    try {
      setLoading(true);
      let allProducts: Product[] = [];
      
      // Get ONLY Shopify products and filter by category
      try {
        const shopifyProducts = await fetchShopifyProductsDirect();
        const convertedShopifyProducts = shopifyProducts
          .filter((product: any) => {
            // Check if product matches any subcategory tags for the given category
            const categoryConfig = CATEGORIES.find(cat => cat.slug === 'skincare'); // Always check skincare for now
            if (!categoryConfig) return false;
            
            const subcategoryConfig = categoryConfig.subcategories.find(sub => sub.name.toLowerCase() === category.toLowerCase());
            if (!subcategoryConfig) return false;
            
            return subcategoryConfig.tags.some(subTag => 
              product.tags?.some((tag: string) => tag.toLowerCase().includes(subTag.toLowerCase())) ||
              product.productType.toLowerCase().includes(subTag.toLowerCase())
            );
          })
          .map((product: any) => ({
            id: product.id,
            name: product.title,
            title: product.title,
            category: mapShopifyCategory(product.productType, product.tags),
            price: parseFloat(product.variants.edges[0]?.node.price.amount || '0') * 4000,
            image: product.featuredImage?.url,
            featuredImage: product.featuredImage,
            variants: product.variants.edges.map((edge: any) => ({
              price: {
                amount: (parseFloat(edge.node.price.amount) * 4000).toString(),
                currencyCode: 'COP'
              }
            })),
            shopify_variant_id: product.variants.edges[0]?.node.id,
            shopify_featured_image: product.featuredImage
          }));
        
        allProducts = convertedShopifyProducts;
      } catch (shopifyError) {
        console.error('Error loading Shopify products:', shopifyError);
      }
      
      setProducts(allProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Map Shopify product types and tags to skincare categories
  const mapShopifyCategory = (productType: string, tags: string[]) => {
    const tagString = tags.join(' ').toLowerCase();
    
    for (const categoryGroup of CATEGORIES) {
      for (const subcategory of categoryGroup.subcategories) {
        const matchesTags = subcategory.tags.some(tag => 
          tagString.includes(tag.toLowerCase()) || 
          productType.toLowerCase().includes(tag.toLowerCase())
        );
        if (matchesTags) {
          return subcategory.name;
        }
      }
    }
    
    return 'skincare';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return <div className="p-4 text-center text-sm text-muted-foreground">Cargando productos...</div>;
  }

  if (products.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No hay productos disponibles en esta categoría
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 p-4 max-h-96 overflow-y-auto">
      {products.map((product) => (
        <div
          key={product.id}
          className="flex items-center space-x-3 p-3 hover:bg-muted rounded-lg cursor-pointer transition-colors"
          onClick={() => onAddToCart(product)}
        >
          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-lg">📦</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium truncate">{product.name}</h4>
            <div className="flex items-center justify-between mt-1">
              <Badge variant="secondary" className="text-xs">
                {formatPrice(product.price || 0)}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductsMenu;