import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, Grid, List, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import { ShopifyProduct } from "@/lib/shopify";
import { fetchShopifyProducts, formatPrice } from "@/lib/shopify";
import { fetchShopifyProductsDirect } from "@/lib/shopify-direct";
import { useShopifyCart } from "@/hooks/useShopifyCart";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ShopifyShop = () => {
  const { category, subcategory } = useParams();
  const [searchParams] = useSearchParams();
  const brandParam = searchParams.get('brand');
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('title');
  const { addToCart } = useShopifyCart();
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, searchTerm, selectedBrand, selectedCategory, category, subcategory, brandParam]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Try direct Shopify API first
      const fetchedProducts = await fetchShopifyProductsDirect();
      setProducts(fetchedProducts);
      console.log(`Loaded ${fetchedProducts.length} products from Shopify (direct)`);
    } catch (error) {
      console.error('Error loading products:', error);
      
      // Fallback: Show mock Shopify products for testing
      const mockProducts = [
        {
          id: 'gid://shopify/Product/1',
          title: 'Green Plum Refreshing Cleanser',
          vendor: 'Beauty of Joseon',
          productType: 'Cleanser',
          tags: ['skincare', 'cleanser'],
          description: 'A gentle cleanser with green plum extract',
          featuredImage: { url: '/lovable-uploads/7292ef8e-2e57-4e8f-8cf2-d3feef410b74.png', altText: 'Green Plum Cleanser' },
          images: { edges: [] },
          variants: {
            edges: [{
              node: {
                id: 'gid://shopify/ProductVariant/1',
                title: 'Default',
                price: { amount: '20.99', currencyCode: 'USD' },
                availableForSale: true
              }
            }]
          }
        },
        {
          id: 'gid://shopify/Product/2', 
          title: 'Relief Sun: Rice + Probiotics SPF50+ PA++++',
          vendor: 'Beauty of Joseon',
          productType: 'Sunscreen',
          tags: ['skincare', 'sunscreen'],
          description: 'Lightweight sunscreen with rice and probiotics',
          featuredImage: { url: '/lovable-uploads/3281175c-1089-4489-9983-97dcc8ee2ce9.png', altText: 'Relief Sun' },
          images: { edges: [] },
          variants: {
            edges: [{
              node: {
                id: 'gid://shopify/ProductVariant/2',
                title: 'Default',
                price: { amount: '28.75', currencyCode: 'USD' },
                availableForSale: true
              }
            }]
          }
        }
      ];
      
      setProducts(mockProducts);
      toast({
        title: "Modo Demo",
        description: "Mostrando productos de prueba. La función de Shopify no está disponible.",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.vendor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by brand
    if (selectedBrand && selectedBrand !== 'all') {
      filtered = filtered.filter(product => product.vendor === selectedBrand);
    }

    // Filter by brand from URL param
    if (brandParam) {
      filtered = filtered.filter(product => 
        product.vendor.toLowerCase() === brandParam.toLowerCase()
      );
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.productType === selectedCategory);
    }

    // Filter by URL category
    if (category) {
      filtered = filtered.filter(product =>
        product.productType.toLowerCase().includes(category.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(category.toLowerCase()))
      );
    }

    // Filter by subcategory
    if (subcategory) {
      filtered = filtered.filter(product =>
        product.tags.some(tag => tag.toLowerCase().includes(subcategory.toLowerCase()))
      );
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return parseFloat(a.variants.edges[0]?.node.price.amount || '0') - 
                 parseFloat(b.variants.edges[0]?.node.price.amount || '0');
        case 'price-desc':
          return parseFloat(b.variants.edges[0]?.node.price.amount || '0') - 
                 parseFloat(a.variants.edges[0]?.node.price.amount || '0');
        case 'vendor':
          return a.vendor.localeCompare(b.vendor);
        default:
          return a.title.localeCompare(b.title);
      }
    });

    setFilteredProducts(filtered);
  };

  const handleAddToCart = (product: ShopifyProduct) => {
    addToCart(product);
  };

  // Get unique brands and categories for filters
  const uniqueBrands = [...new Set(products.map(p => p.vendor))].filter(Boolean);
  const uniqueCategories = [...new Set(products.map(p => p.productType))].filter(Boolean);

  const breadcrumbItems = [
    { label: "Inicio", href: "/" },
    { label: "Tienda", href: "/shopify-shop" },
  ];

  if (category) {
    breadcrumbItems.push({ 
      label: category.charAt(0).toUpperCase() + category.slice(1), 
      href: `/shopify-shop/${category}` 
    });
  }

  if (subcategory) {
    breadcrumbItems.push({ 
      label: subcategory.charAt(0).toUpperCase() + subcategory.slice(1), 
      href: `/shopify-shop/${category}/${subcategory}` 
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Tienda Shopify
            {category && ` - ${category.charAt(0).toUpperCase() + category.slice(1)}`}
            {subcategory && ` - ${subcategory.charAt(0).toUpperCase() + subcategory.slice(1)}`}
          </h1>
          <p className="text-muted-foreground">
            Descubre nuestra colección de productos de skincare coreano
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-wrap gap-4">
            <Input
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
            
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todas las marcas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las marcas</SelectItem>
                {uniqueBrands.map(brand => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {uniqueCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Nombre A-Z</SelectItem>
                <SelectItem value="price-asc">Precio menor a mayor</SelectItem>
                <SelectItem value="price-desc">Precio mayor a menor</SelectItem>
                <SelectItem value="vendor">Marca</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
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
        </div>

        {/* Products */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Cargando productos...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron productos.</p>
            <Button onClick={loadProducts} className="mt-4">
              Recargar productos
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-muted-foreground">
                Mostrando {filteredProducts.length} de {products.length} productos
              </p>
            </div>
            
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-shadow">
                  {product.featuredImage && (
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={product.featuredImage.url}
                        alt={product.featuredImage.altText || product.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">{product.vendor}</p>
                      <h3 className="font-semibold line-clamp-2">{product.title}</h3>
                    </div>
                    
                    {product.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg">
                        {formatPrice(
                          product.variants.edges[0]?.node.price.amount || '0',
                          product.variants.edges[0]?.node.price.currencyCode
                        )}
                      </span>
                      
                      <Button
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.variants.edges[0]?.node.availableForSale}
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {product.variants.edges[0]?.node.availableForSale ? 'Agregar' : 'Agotado'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default ShopifyShop;