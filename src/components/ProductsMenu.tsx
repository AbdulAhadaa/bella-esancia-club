import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

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
      
      // Only get products from database inventory
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select('*')
        .eq('category', category);
      
      if (inventoryError) throw inventoryError;
      setProducts(inventoryData || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
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