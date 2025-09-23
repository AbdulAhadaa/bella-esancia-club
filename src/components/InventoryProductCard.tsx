import { useState } from "react";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";

interface InventoryProduct {
  id: string;
  name: string;
  brand?: string;
  category: string;
  price: number;
  image?: string;
  description?: string;
  tags?: string[];
  stock: number;
  shopify_variant_id?: string;
  shopify_product_id?: string;
}

interface InventoryProductCardProps {
  product: InventoryProduct;
}

export const InventoryProductCard = ({ product }: InventoryProductCardProps) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      shopify_variant_id: product.shopify_variant_id
    });
    
    toast({
      title: "Producto agregado",
      description: `${product.name} se agregó al carrito`,
    });
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Eliminado de favoritos" : "Agregado a favoritos",
      description: `${product.name} ${isWishlisted ? 'se eliminó de' : 'se agregó a'} tu lista de favoritos`,
    });
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md">
      <div className="relative overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-64 bg-muted flex items-center justify-center">
            <span className="text-4xl">📦</span>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-sm transition-colors ${
            isWishlisted ? 'text-red-500 bg-white/90' : 'text-muted-foreground bg-white/70 hover:text-red-500'
          }`}
          onClick={handleWishlist}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </Button>

        {product.stock === 0 && (
          <Badge className="absolute top-3 left-3 bg-destructive">
            Agotado
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          {product.brand && (
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {product.brand}
            </p>
          )}
          
          <h3 className="font-semibold line-clamp-2 text-sm leading-tight">
            {product.name}
          </h3>
          
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="text-xs text-muted-foreground ml-1">(4.8)</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">
              {formatPrice(product.price)}
            </span>
          </div>
          
          {product.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}
          
          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              className="flex-1"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {product.stock === 0 ? 'Agotado' : 'Agregar'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};