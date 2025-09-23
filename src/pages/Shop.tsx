import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Grid, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductFilters from "@/components/ProductFilters";
import Breadcrumbs from "@/components/Breadcrumbs";
import ComingSoonCard from "@/components/ComingSoonCard";
import { ShopifyProduct, ProductFilter, CATEGORIES } from "@/types/shopify";

const Shop = () => {
  const { category, subcategory } = useParams();
  const [searchParams] = useSearchParams();
  const brandParam = searchParams.get('brand');
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, [category, subcategory, brandParam]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      console.log('Intentando cargar productos de Shopify...');
      
      const { data, error } = await supabase.functions.invoke('shopify-products');
      
      if (error) {
        console.error('Error fetching from Shopify:', error);
        console.log('Cargando productos del inventario local...');
        // Load from Supabase inventory immediately when Shopify fails
        const { data: invData, error: invError } = await supabase
          .from('inventory')
          .select('*');

        if (invError) {
          console.error('Inventory error:', invError);
          setProducts([]);
          setFilteredProducts([]);
          return;
        }

        const invProducts: ShopifyProduct[] = (invData || []).map((item: any) => ({
          id: item.id,
          title: item.name,
          description: item.description || '',
          handle: (item.name || '').toLowerCase().split(' ').join('-') || item.id,
          vendor: 'Nuabok',
          productType: item.category || '',
          tags: item.skin_types || [],
          featuredImage: item.image ? { url: item.image, altText: item.name } : undefined,
          images: item.image ? { edges: [{ node: { url: item.image, altText: item.name } }] } : { edges: [] },
          variants: {
            edges: [
              {
                node: {
                  id: item.id,
                  title: 'Default',
                  price: { amount: String(item.price || 0), currencyCode: 'COP' },
                  availableForSale: (item.stock ?? 0) > 0
                }
              }
            ]
          }
        }));
        
        setProducts(invProducts);
        setFilteredProducts(invProducts);
        console.log(`Cargados ${invProducts.length} productos del inventario local`);
        
        return;
      }

      // Si Shopify responde pero no tiene productos, cargar desde inventario
      if (data?.data?.products?.edges) {
        const productsList = data.data.products.edges.map((edge: any) => edge.node);
        if (productsList.length > 0) {
          setProducts(productsList);
          setFilteredProducts(productsList);
          
          // Extract unique brands and categories
          const uniqueBrands = [...new Set(productsList.map((p: ShopifyProduct) => p.vendor).filter(Boolean))] as string[];
          const uniqueCategories = [...new Set(productsList.map((p: ShopifyProduct) => p.productType).filter(Boolean))] as string[];
          
          setBrands(uniqueBrands);
          setCategories(uniqueCategories);
          
          // Apply initial filters based on URL parameters
          let initialFiltered = productsList;
          
          // Filter by brand if specified in URL
          if (brandParam) {
            initialFiltered = initialFiltered.filter(product => 
              product.vendor.toLowerCase() === brandParam.toLowerCase()
            );
          }
          
          setFilteredProducts(initialFiltered);
          console.log(`Cargados ${productsList.length} productos de Shopify`);
          return;
        }
      }

      // Fallback: load from Supabase inventory when Shopify fails or returns empty
      console.log('Shopify no tiene productos, cargando del inventario local...');
      const { data: invData, error: invError } = await supabase
        .from('inventory')
        .select('*');

      if (invError) {
        console.error('Inventory fallback error:', invError);
        setProducts([]);
        setFilteredProducts([]);
      } else {
        const invProducts: ShopifyProduct[] = (invData || []).map((item: any) => ({
          id: item.id,
          title: item.name,
          description: item.description || '',
          handle: (item.name || '').toLowerCase().split(' ').join('-') || item.id,
          vendor: 'Nuabok',
          productType: item.category || '',
          tags: item.skin_types || [],
          featuredImage: item.image ? { url: item.image, altText: item.name } : undefined,
          images: item.image ? { edges: [{ node: { url: item.image, altText: item.name } }] } : { edges: [] },
          variants: {
            edges: [
              {
                node: {
                  id: item.id,
                  title: 'Default',
                  price: { amount: String(item.price || 0), currencyCode: 'COP' },
                  availableForSale: (item.stock ?? 0) > 0
                }
              }
            ]
          }
        }));
        setProducts(invProducts);
        setFilteredProducts(invProducts);
        console.log(`Cargados ${invProducts.length} productos del inventario local`);
      }
    } catch (error) {
      console.error('Error:', error);

      // Fallback to Supabase inventory when Shopify fails
      const { data: invData, error: invError } = await supabase
        .from('inventory')
        .select('*');

      if (invError) {
        console.error('Inventory fallback error:', invError);
        toast({
          title: "Error",
          description: "No pudimos cargar productos. Intenta de nuevo.",
          variant: "destructive",
        });
      } else {
        const invProducts: ShopifyProduct[] = (invData || []).map((item: any) => ({
          id: item.id,
          title: item.name,
          description: item.description || '',
          handle: (item.name || '').toLowerCase().split(' ').join('-') || item.id,
          vendor: 'Nuabok',
          productType: item.category || '',
          tags: item.skin_types || [],
          featuredImage: item.image ? { url: item.image, altText: item.name } : undefined,
          images: item.image ? { edges: [{ node: { url: item.image, altText: item.name } }] } : { edges: [] },
          variants: {
            edges: [
              {
                node: {
                  id: item.id,
                  title: 'Default',
                  price: { amount: String(item.price || 0), currencyCode: 'COP' },
                  availableForSale: (item.stock ?? 0) > 0
                }
              }
            ]
          }
        }));
        setProducts(invProducts);
        setFilteredProducts(invProducts);
        toast({
          title: "Mostrando inventario local",
          description: "Shopify no respondió, mostrando productos del inventario interno.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (filters: ProductFilter) => {
    let filtered = [...products];

    // Filter by search term
    if (filters.search) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(filters.search!.toLowerCase()) ||
        product.description.toLowerCase().includes(filters.search!.toLowerCase()) ||
        product.vendor.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }

    // Filter by brand (from filters or URL parameter)
    const activeBrand = filters.brand || brandParam;
    if (activeBrand) {
      filtered = filtered.filter(product => 
        product.vendor.toLowerCase() === activeBrand.toLowerCase()
      );
    }

    // Filter by category/subcategory
    if (category) {
      const categoryConfig = CATEGORIES.find(c => c.slug === category);
      if (categoryConfig && subcategory) {
        const subcategoryConfig = categoryConfig.subcategories.find(s => s.slug === subcategory);
        if (subcategoryConfig) {
          filtered = filtered.filter(product =>
            subcategoryConfig.tags.some(tag =>
              product.tags.some(productTag => 
                productTag.toLowerCase().includes(tag.toLowerCase())
              ) ||
              product.title.toLowerCase().includes(tag.toLowerCase()) ||
              product.productType.toLowerCase().includes(tag.toLowerCase())
            )
          );
        }
      } else if (categoryConfig) {
        // Filter by category using productType primarily for skincare
        if (category === 'skincare') {
          filtered = filtered.filter(product =>
            product.productType.toLowerCase().includes('skincare') ||
            product.productType.toLowerCase().includes('skin') ||
            categoryConfig.subcategories.some(sub =>
              sub.tags.some(tag =>
                product.tags.some(productTag => 
                  productTag.toLowerCase().includes(tag.toLowerCase())
                ) ||
                product.title.toLowerCase().includes(tag.toLowerCase()) ||
                product.productType.toLowerCase().includes(tag.toLowerCase())
              )
            )
          );
        } else {
          // Filter by category tags for other categories
          const categoryTags = categoryConfig.subcategories.flatMap(sub => sub.tags);
          filtered = filtered.filter(product =>
            categoryTags.some(tag =>
              product.tags.some(productTag => 
                productTag.toLowerCase().includes(tag.toLowerCase())
              ) ||
              product.title.toLowerCase().includes(tag.toLowerCase()) ||
              product.productType.toLowerCase().includes(tag.toLowerCase())
            )
          );
        }
      }
    }

    // Filter by price
    if (filters.minPrice || filters.maxPrice) {
      filtered = filtered.filter(product => {
        const price = parseFloat(product.variants.edges[0]?.node.price.amount || '0');
        const priceInCOP = price * (product.variants.edges[0]?.node.price.currencyCode === 'USD' ? 4000 : 1);
        
        if (filters.minPrice && priceInCOP < filters.minPrice) return false;
        if (filters.maxPrice && priceInCOP > filters.maxPrice) return false;
        
        return true;
      });
    }

    setFilteredProducts(filtered);
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

  // Build breadcrumbs
  const breadcrumbItems = [];
  if (category) {
    const categoryConfig = CATEGORIES.find(c => c.slug === category);
    if (categoryConfig) {
      breadcrumbItems.push({
        label: categoryConfig.name,
        href: `/shop/${category}`
      });
      
      if (subcategory) {
        const subcategoryConfig = categoryConfig.subcategories.find(s => s.slug === subcategory);
        if (subcategoryConfig) {
          breadcrumbItems.push({
            label: subcategoryConfig.name
          });
        }
      }
    }
  }

  // Get page title
  const getPageTitle = () => {
    if (brandParam) {
      return `Productos de ${brandParam}`;
    }
    if (category && subcategory) {
      const categoryConfig = CATEGORIES.find(c => c.slug === category);
      const subcategoryConfig = categoryConfig?.subcategories.find(s => s.slug === subcategory);
      return subcategoryConfig?.name || 'Productos';
    }
    if (category) {
      const categoryConfig = CATEGORIES.find(c => c.slug === category);
      return categoryConfig?.name || 'Productos';
    }
    return 'Todos los productos';
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
      
      <main className="container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{getPageTitle()}</h1>
            <p className="text-muted-foreground">
              {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <ProductFilters
              onFiltersChange={handleFiltersChange}
              brands={brands}
              categories={categories}
              isLoading={loading}
            />
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ComingSoonCard
                  title={getPageTitle()}
                  description="Estamos trabajando para traerte los mejores productos. ¡Vuelve pronto!"
                />
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                  : "space-y-4"
              }>
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onBuyNow={handleBuyNow}
                    isCheckoutLoading={checkoutLoading === product.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Shop;