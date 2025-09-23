import { Heart, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StorefrontProduct, formatPrice } from "@/lib/shopify-storefront";
import { useStorefrontCart } from "@/hooks/useStorefrontCart";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Link } from "react-router-dom";

interface StorefrontProductCardProps {
  product: StorefrontProduct;
}

export function StorefrontProductCard({ product }: StorefrontProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addItem, isLoading } = useStorefrontCart();
  const { toast } = useToast();

  const defaultVariant = product.variants.edges[0]?.node;
  const isAvailable = defaultVariant?.availableForSale && (defaultVariant?.quantityAvailable || 0) > 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!defaultVariant) {
      toast({
        title: "Error",
        description: "Este producto no tiene variantes disponibles",
        variant: "destructive",
      });
      return;
    }

    try {
      await addItem(defaultVariant.id, 1);
    } catch (error) {
      // Error already handled in addItem
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Eliminado de favoritos" : "Agregado a favoritos",
      description: isWishlisted 
        ? "El producto se eliminó de tu lista de deseos" 
        : "El producto se agregó a tu lista de deseos",
    });
  };

  return (
    <Link to={`/product/${product.handle}`}>
      <Card className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="relative overflow-hidden">
          {product.featuredImage ? (
            <img
              src={product.featuredImage.url}
              alt={product.featuredImage.altText || product.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-48 bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">Sin imagen</span>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-2 right-2 rounded-full ${
              isWishlisted 
                ? "bg-red-100 text-red-600 hover:bg-red-200" 
                : "bg-white/80 hover:bg-white"
            }`}
            onClick={handleWishlist}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
          </Button>

          {!isAvailable && (
            <Badge variant="secondary" className="absolute top-2 left-2">
              Agotado
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {product.vendor}
            </p>
            
            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {product.title}
            </h3>

            <div className="flex items-center gap-1">
              <span className="text-yellow-400">★★★★★</span>
              <span className="text-xs text-muted-foreground">(4.8)</span>
            </div>

            {defaultVariant && (
              <p className="font-bold text-lg">
                {formatPrice(defaultVariant.price.amount, defaultVariant.price.currencyCode)}
              </p>
            )}

            {product.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {product.description.replace(/<[^>]*>/g, '')}
              </p>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={!isAvailable || isLoading}
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              {isAvailable ? "Agregar" : "Agotado"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}