import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Heart, ShoppingCart, Star, Minus, Plus } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import { StorefrontProductCard } from "@/components/StorefrontProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getProduct, getRecommendedProducts, type StorefrontProduct, formatPrice } from "@/lib/shopify-storefront";
import { useStorefrontCart } from "@/hooks/useStorefrontCart";
import { useToast } from "@/hooks/use-toast";

export default function StorefrontProduct() {
  const { handle } = useParams<{ handle: string }>();
  const { addItem, isLoading: cartLoading } = useStorefrontCart();
  const { toast } = useToast();

  const [product, setProduct] = useState<StorefrontProduct | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<StorefrontProduct[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (handle) {
      loadProduct();
    }
  }, [handle]);

  useEffect(() => {
    if (product) {
      // Set default variant
      const defaultVariant = product.variants.edges[0]?.node;
      if (defaultVariant) {
        setSelectedVariantId(defaultVariant.id);
      }
      
      // Load recommendations
      loadRecommendations();
    }
  }, [product]);

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      const productData = await getProduct(handle!);
      setProduct(productData);
    } catch (error) {
      console.error('Error loading product:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el producto",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecommendations = async () => {
    if (!product) return;
    
    try {
      const recommendations = await getRecommendedProducts(product.id);
      setRecommendedProducts(recommendations.slice(0, 4));
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const selectedVariant = product?.variants.edges.find(edge => edge.node.id === selectedVariantId)?.node;
  const isAvailable = selectedVariant?.availableForSale && (selectedVariant?.quantityAvailable || 0) > 0;

  const images = product?.images.edges.map(edge => edge.node) || [];
  const displayImages = product?.featuredImage ? [product.featuredImage, ...images] : images;

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast({
        title: "Error",
        description: "Selecciona una variante del producto",
        variant: "destructive",
      });
      return;
    }

    try {
      await addItem(selectedVariant.id, quantity);
    } catch (error) {
      // Error already handled in addItem
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Eliminado de favoritos" : "Agregado a favoritos",
      description: isWishlisted 
        ? "El producto se eliminó de tu lista de deseos" 
        : "El producto se agregó a tu lista de deseos",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p>Cargando producto...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
            <p className="text-muted-foreground">El producto que buscas no existe o ha sido eliminado.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Breadcrumbs items={[
          { label: "Inicio", href: "/" },
          { label: "Productos", href: "/catalog" },
          { label: product?.title || "Producto", href: "#" }
        ]} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
              {displayImages[selectedImageIndex] ? (
                <img
                  src={displayImages[selectedImageIndex].url}
                  alt={displayImages[selectedImageIndex].altText || product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-muted-foreground">Sin imagen</span>
                </div>
              )}
            </div>
            
            {displayImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {displayImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square overflow-hidden rounded border-2 ${
                      selectedImageIndex === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.altText || `${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
                {product.vendor}
              </p>
              <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">(4.8) • 125 reseñas</span>
              </div>
              
              {selectedVariant && (
                <p className="text-3xl font-bold text-primary">
                  {formatPrice(selectedVariant.price.amount, selectedVariant.price.currencyCode)}
                </p>
              )}
              
              <div className="flex items-center gap-2 mt-2">
                {isAvailable ? (
                  <Badge variant="default">Disponible</Badge>
                ) : (
                  <Badge variant="secondary">Agotado</Badge>
                )}
                {selectedVariant?.quantityAvailable && (
                  <span className="text-sm text-muted-foreground">
                    {selectedVariant.quantityAvailable} en stock
                  </span>
                )}
              </div>
            </div>

            {/* Variant Selection */}
            {product.variants.edges.length > 1 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Variante</label>
                <Select value={selectedVariantId} onValueChange={setSelectedVariantId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {product.variants.edges.map(({ node: variant }) => (
                      <SelectItem key={variant.id} value={variant.id}>
                        {variant.title} - {formatPrice(variant.price.amount, variant.price.currencyCode)}
                        {!variant.availableForSale && " (Agotado)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <label className="text-sm font-medium mb-2 block">Cantidad</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={!isAvailable || (selectedVariant?.quantityAvailable && quantity >= selectedVariant.quantityAvailable)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={!isAvailable || cartLoading}
                className="flex-1"
                size="lg"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {cartLoading ? "Agregando..." : "Agregar al Carrito"}
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={handleWishlist}
                className={isWishlisted ? "text-red-600 border-red-600" : ""}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
              </Button>
            </div>

            {/* Product Description */}
            {product.description && (
              <div>
                <h3 className="font-medium mb-2">Descripción</h3>
                <div 
                  className="text-muted-foreground prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}

            {/* Product Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Marca:</span>
                <p className="text-muted-foreground">{product.vendor}</p>
              </div>
              <div>
                <span className="font-medium">Tipo:</span>
                <p className="text-muted-foreground">{product.productType}</p>
              </div>
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Categorías</h3>
                <div className="flex flex-wrap gap-1">
                  {product.tags.slice(0, 6).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recommended Products */}
        {recommendedProducts.length > 0 && (
          <section>
            <Card>
              <CardHeader>
                <CardTitle>También te puede gustar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recommendedProducts.map((product) => (
                    <StorefrontProductCard key={product.id} product={product} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}