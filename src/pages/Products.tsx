import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingCart, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface ShopifyProduct {
  id: string;
  title: string;
  description: string;
  featuredImage?: {
    url: string;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        price: {
          amount: string;
          currencyCode: string;
        };
      };
    }>;
  };
}

const Products = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('shopify-products');
      
      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      console.log('Products response:', data);
      
      if (data?.data?.products?.edges) {
        const productsList = data.data.products.edges.map((edge: any) => edge.node);
        setProducts(productsList);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async (product: ShopifyProduct) => {
    const variantId = product.variants.edges[0]?.node.id;
    
    if (!variantId) {
      toast({
        title: "Error",
        description: "Product variant not found",
        variant: "destructive",
      });
      return;
    }

    try {
      setCheckoutLoading(product.id);
      
      const { data, error } = await supabase.functions.invoke('shopify-checkout', {
        body: {
          variantId,
          quantity: 1
        }
      });

      if (error) {
        console.error('Checkout error:', error);
        throw error;
      }

      console.log('Checkout response:', data);

      if (data?.checkoutUrl) {
        window.open(data.checkoutUrl, '_blank');
      } else {
        throw new Error('No checkout URL received');
      }

    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "Failed to create checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCheckoutLoading(null);
    }
  };

  const formatPrice = (amount: string, currency: string) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency === 'USD' ? 'COP' : currency,
      minimumFractionDigits: 0,
    }).format(parseFloat(amount) * (currency === 'USD' ? 4000 : 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Cargando productos...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Nuestros Productos</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubre nuestra colección de productos de skincare coreano, 
            cuidadosamente seleccionados para tu rutina de belleza.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold mb-4">No hay productos disponibles</h2>
            <p className="text-muted-foreground">Pronto tendremos productos increíbles para ti.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const variant = product.variants.edges[0]?.node;
              const isLoadingCheckout = checkoutLoading === product.id;
              
              return (
                <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="pb-3">
                    <div className="aspect-square relative overflow-hidden rounded-lg bg-muted mb-3">
                      {product.featuredImage?.url ? (
                        <img
                          src={product.featuredImage.url}
                          alt={product.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-background"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-base line-clamp-2">{product.title}</CardTitle>
                    {variant && (
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-sm font-semibold">
                          {formatPrice(variant.price.amount, variant.price.currencyCode)}
                        </Badge>
                      </div>
                    )}
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {product.description && (
                      <CardDescription className="line-clamp-2">
                        {product.description.replace(/<[^>]*>/g, '').substring(0, 100)}...
                      </CardDescription>
                    )}
                  </CardContent>
                  
                  <CardFooter className="pt-3">
                    <Button
                      onClick={() => handleBuyNow(product)}
                      disabled={isLoadingCheckout || !variant}
                      className="w-full"
                      size="sm"
                    >
                      {isLoadingCheckout ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Comprar Ahora
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Products;