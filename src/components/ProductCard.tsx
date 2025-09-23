import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Loader2, Star } from "lucide-react";
import { ShopifyProduct } from "@/types/shopify";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: ShopifyProduct;
  onBuyNow: (product: ShopifyProduct) => Promise<void>;
  isCheckoutLoading: boolean;
}

const ProductCard = ({ product, onBuyNow, isCheckoutLoading }: ProductCardProps) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const variant = product.variants.edges[0]?.node;

  const formatPrice = (amount: string, currency: string) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency === 'USD' ? 'COP' : currency,
      minimumFractionDigits: 0,
    }).format(parseFloat(amount) * (currency === 'USD' ? 4000 : 1));
  };

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      title: product.title,
      price: variant?.price.amount || '0',
      currency: variant?.price.currencyCode || 'COP',
      image: product.featuredImage?.url,
      quantity: 1
    });
    
    toast({
      title: "Producto agregado",
      description: `${product.title} se agregó al carrito`,
    });
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Eliminado de favoritos" : "Agregado a favoritos",
      description: `${product.title} ${isWishlisted ? 'eliminado de' : 'agregado a'} tu lista de deseos`,
    });
  };

  // Get all product images
  const productImages = product.images?.edges.map(edge => edge.node) || 
    (product.featuredImage ? [product.featuredImage] : []);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="aspect-square relative overflow-hidden rounded-lg bg-muted mb-3">
          {productImages[0]?.url ? (
            <img
              src={productImages[0].url}
              alt={productImages[0].altText || product.title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          
          {productImages.length > 1 && (
            <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              +{productImages.length - 1} fotos
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-background ${
              isWishlisted ? 'text-red-500' : ''
            }`}
            onClick={handleWishlist}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </Button>
        </div>
        
        <div className="space-y-2">
          <Badge variant="outline" className="text-xs">
            {product.vendor}
          </Badge>
          <h3 className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">
            {product.title}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="text-xs text-muted-foreground ml-1">(4.5)</span>
          </div>
          
          {variant && (
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-primary">
                {formatPrice(variant.price.amount, variant.price.currencyCode)}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 flex-1">
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description.replace(/<[^>]*>/g, '').substring(0, 100)}...
          </p>
        )}
      </CardContent>
      
      <CardFooter className="pt-3 space-y-2">
        <div className="w-full space-y-2">
          <Button
            onClick={handleAddToCart}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Agregar al carrito
          </Button>
          <Button
            onClick={() => onBuyNow(product)}
            disabled={isCheckoutLoading || !variant?.availableForSale}
            className="w-full"
            size="sm"
          >
            {isCheckoutLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              'Comprar ahora'
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;