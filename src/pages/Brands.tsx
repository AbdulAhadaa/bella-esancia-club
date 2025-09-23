import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import { ShopifyProduct } from "@/types/shopify";

const Brands = () => {
  const [brands, setBrands] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('shopify-products');
      
      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      if (data?.data?.products?.edges) {
        const productsList = data.data.products.edges.map((edge: any) => edge.node) as ShopifyProduct[];
        
        // Count products by brand
        const brandCounts = productsList.reduce((acc, product) => {
          if (product.vendor) {
            acc[product.vendor] = (acc[product.vendor] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);

        const brandsArray = Object.entries(brandCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setBrands(brandsArray);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load brands. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Marcas' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Cargando marcas...</p>
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
      
      <main className="container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Marcas</h1>
          <p className="text-muted-foreground">
            Explora nuestras {brands.length} marcas cuidadosamente seleccionadas
          </p>
        </div>

        {brands.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold mb-4">No hay marcas disponibles</h2>
            <p className="text-muted-foreground">Pronto tendremos marcas increíbles para ti.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {brands.map((brand) => (
              <Card key={brand.name} className="hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-primary">
                      {brand.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{brand.name}</CardTitle>
                </CardHeader>
                
                <CardContent className="text-center pt-0">
                  <p className="text-sm text-muted-foreground mb-4">
                    {brand.count} producto{brand.count !== 1 ? 's' : ''}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => window.location.href = `/shop?brand=${encodeURIComponent(brand.name)}`}
                  >
                    Ver productos
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Brands;