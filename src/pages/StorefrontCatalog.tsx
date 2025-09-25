import { useState, useEffect } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { Search, Filter, Grid, List, ChevronDown } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import { InventoryProductCard } from "@/components/InventoryProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { fetchShopifyProductsDirect } from "@/lib/shopify-direct";
import { CATEGORIES } from "@/types/shopify";

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
  isShopify?: boolean;
  shopify_variant_id?: string;
  productType?: string;
}

export default function StorefrontCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { category, subcategory } = useParams();
  const { toast } = useToast();

  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<InventoryProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('title');
  
  // Filter visibility
  const [showBrands, setShowBrands] = useState(false);
  const [showTypes, setShowTypes] = useState(false);
  const [showTags, setShowTags] = useState(false);

  // Pagination
  const [hasNextPage, setHasNextPage] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [category, subcategory]);

  useEffect(() => {
    applyFilters();
  }, [products, searchTerm, selectedBrands, selectedTypes, selectedTags, sortBy]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      let allProducts: InventoryProduct[] = [];

      // Load ONLY Shopify products and convert to inventory format
      try {
        const shopifyProducts = await fetchShopifyProductsDirect();
        console.log('Raw Shopify products:', shopifyProducts.length);
        
        const convertedShopifyProducts = shopifyProducts.map((product: any) => {
          console.log('Product:', product.title, 'ProductType:', product.productType);
          return {
            id: product.id,
            name: product.title,
            brand: product.vendor,
            category: mapShopifyCategory(product.productType, product.tags),
            price: parseFloat(product.variants.edges[0]?.node.price.amount || '0'),
            image: product.featuredImage?.url,
            description: product.description,
            tags: product.tags,
            productType: product.productType,
            stock: 999,
            isShopify: true,
            shopify_variant_id: product.variants.edges[0]?.node.id,
            shopify_featured_image: product.featuredImage
          };
        });
        
        console.log('Converted products:', convertedShopifyProducts.length);
        console.log('Category:', category, 'Subcategory:', subcategory);
        
        // Filter Shopify products by category and subcategory if specified
        let filteredShopifyProducts = convertedShopifyProducts;
        
        if (category && !subcategory) {
          // Filter by main category
          const categoryConfig = CATEGORIES.find(cat => cat.slug === category);
          if (categoryConfig) {
            const allCategoryTags = categoryConfig.subcategories.flatMap(sub => sub.tags);
            filteredShopifyProducts = convertedShopifyProducts.filter((p: InventoryProduct) => {
              return p.tags?.some(tag => 
                allCategoryTags.some(catTag => tag.toLowerCase().includes(catTag.toLowerCase()))
              ) || p.productType?.toLowerCase().includes(category.toLowerCase());
            });
          }
        } else if (subcategory) {
          // Match by product title/name since productType is generic "Skincare"
          filteredShopifyProducts = convertedShopifyProducts.filter((p: InventoryProduct) => {
            const title = p.name.toLowerCase();
            
            if (subcategory === 'sunscreen') {
              return title.includes('sun') || title.includes('spf');
            } else if (subcategory === 'eye-creams') {
              return title.includes('eye');
            } else if (subcategory === 'facial-cleansers') {
              return title.includes('cleanser') || title.includes('cleansing');
            }
            
            return false;
          });
          console.log(`Filtering by subcategory "${subcategory}" found ${filteredShopifyProducts.length} products`);
        }
        
        allProducts = filteredShopifyProducts;
        console.log('Final filtered products:', allProducts.length);
      } catch (shopifyError) {
        console.error('Error loading Shopify products:', shopifyError);
      }
      
      setProducts(allProducts);
      setHasNextPage(false);
      setCursor(null);

    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Map Shopify product types and tags to categories using predefined structure
  const mapShopifyCategory = (productType: string, tags: string[]) => {
    const tagString = tags.join(' ').toLowerCase();
    
    // Check against predefined category tags from CATEGORIES
    for (const category of CATEGORIES) {
      for (const subcategory of category.subcategories) {
        const matchesTags = subcategory.tags.some(tag => 
          tagString.includes(tag.toLowerCase()) || 
          productType.toLowerCase().includes(tag.toLowerCase())
        );
        if (matchesTags) {
          return category.slug; // Return main category slug
        }
      }
    }
    
    return 'skincare'; // Default to skincare category
  };

  const loadMore = () => {
    if (hasNextPage && cursor && !isLoadingMore) {
      loadProducts();
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product =>
        product.brand && selectedBrands.includes(product.brand)
      );
    }

    // Type filter (using productType)
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(product =>
        product.productType && selectedTypes.includes(product.productType)
      );
    }

    // Tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(product =>
        product.tags && selectedTags.some(tag => product.tags.includes(tag))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'vendor':
          return (a.brand || '').localeCompare(b.brand || '');
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  };

  // Get unique values for filters
  const uniqueBrands = [...new Set(products.map(p => p.brand))].filter(Boolean).sort();
  const uniqueTypes = [...new Set(products.map(p => p.productType))].filter(Boolean).sort();
  const uniqueTags = [...new Set(products.flatMap(p => p.tags || []))].filter(Boolean).sort().slice(0, 20); // Limit tags

  const handleBrandChange = (brand: string, checked: boolean) => {
    setSelectedBrands(prev =>
      checked ? [...prev, brand] : prev.filter(b => b !== brand)
    );
  };

  const handleTypeChange = (type: string, checked: boolean) => {
    setSelectedTypes(prev =>
      checked ? [...prev, type] : prev.filter(t => t !== type)
    );
  };

  const handleTagChange = (tag: string, checked: boolean) => {
    setSelectedTags(prev =>
      checked ? [...prev, tag] : prev.filter(t => t !== tag)
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedBrands([]);
    setSelectedTypes([]);
    setSelectedTags([]);
    setSearchParams({});
  };

  const hasActiveFilters = searchTerm || selectedBrands.length > 0 || selectedTypes.length > 0 || selectedTags.length > 0;

  const getPageTitle = () => {
    if (category && subcategory) {
      const categoryConfig = CATEGORIES.find(cat => cat.slug === category);
      const subcategoryConfig = categoryConfig?.subcategories.find(sub => sub.slug === subcategory);
      return subcategoryConfig ? subcategoryConfig.name : `${category} - ${subcategory}`;
    } else if (category) {
      const categoryConfig = CATEGORIES.find(cat => cat.slug === category);
      return categoryConfig ? categoryConfig.name : category.charAt(0).toUpperCase() + category.slice(1);
    }
    return "Catálogo de Productos";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Breadcrumbs items={[
          { label: "Inicio", href: "/" },
          { label: getPageTitle(), href: "#" }
        ]} />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{getPageTitle()}</h1>
          <p className="text-muted-foreground">
            Descubre nuestra selección de productos de skincare de alta calidad
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 space-y-6">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar productos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Ordenar por</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="title">Nombre</SelectItem>
                        <SelectItem value="vendor">Marca</SelectItem>
                        <SelectItem value="price-low">Precio: Menor a Mayor</SelectItem>
                        <SelectItem value="price-high">Precio: Mayor a Menor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Brands Filter */}
                  {uniqueBrands.length > 0 && (
                    <Collapsible open={showBrands} onOpenChange={setShowBrands}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between p-0">
                          <span className="text-sm font-medium">Marcas</span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-2 mt-2">
                        {uniqueBrands.slice(0, 10).map((brand) => (
                          <div key={brand} className="flex items-center space-x-2">
                            <Checkbox
                              id={`brand-${brand}`}
                              checked={selectedBrands.includes(brand)}
                              onCheckedChange={(checked) => handleBrandChange(brand, !!checked)}
                            />
                            <label
                              htmlFor={`brand-${brand}`}
                              className="text-sm cursor-pointer"
                            >
                              {brand}
                            </label>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  )}

                  {/* Types Filter */}
                  {uniqueTypes.length > 0 && (
                    <Collapsible open={showTypes} onOpenChange={setShowTypes}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between p-0">
                          <span className="text-sm font-medium">Tipo de Producto</span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-2 mt-2">
                        {uniqueTypes.slice(0, 10).map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                              id={`type-${type}`}
                              checked={selectedTypes.includes(type)}
                              onCheckedChange={(checked) => handleTypeChange(type, !!checked)}
                            />
                            <label
                              htmlFor={`type-${type}`}
                              className="text-sm cursor-pointer"
                            >
                              {type}
                            </label>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  )}

                  {/* Tags Filter */}
                  {uniqueTags.length > 0 && (
                    <Collapsible open={showTags} onOpenChange={setShowTags}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between p-0">
                          <span className="text-sm font-medium">Categorías</span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-2 mt-2">
                        {uniqueTags.slice(0, 15).map((tag) => (
                          <div key={tag} className="flex items-center space-x-2">
                            <Checkbox
                              id={`tag-${tag}`}
                              checked={selectedTags.includes(tag)}
                              onCheckedChange={(checked) => handleTagChange(tag, !!checked)}
                            />
                            <label
                              htmlFor={`tag-${tag}`}
                              className="text-sm cursor-pointer"
                            >
                              {tag}
                            </label>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  )}

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={clearFilters} className="w-full">
                      Limpiar Filtros
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {filteredProducts.length} productos encontrados
                </span>
                {hasActiveFilters && (
                  <Badge variant="secondary">Filtros activos</Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="text-center py-12">
                <p>Cargando productos...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No se encontraron productos</p>
                {hasActiveFilters && (
                  <Button onClick={clearFilters}>Limpiar filtros</Button>
                )}
              </div>
            ) : (
              <>
                {/* Products Grid */}
                <div className={
                  viewMode === 'grid'
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-4"
                }>
                  {filteredProducts.map((product) => (
                    <InventoryProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Load More Button */}
                {hasNextPage && (
                  <div className="text-center mt-8">
                    <Button
                      onClick={loadMore}
                      disabled={isLoadingMore}
                      size="lg"
                    >
                      {isLoadingMore ? "Cargando..." : "Cargar más productos"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}