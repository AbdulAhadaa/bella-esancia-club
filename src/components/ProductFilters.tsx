import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, X } from "lucide-react";
import { ProductFilter } from "@/types/shopify";

interface ProductFiltersProps {
  onFiltersChange: (filters: ProductFilter) => void;
  brands: string[];
  categories: string[];
  isLoading: boolean;
}

const ProductFilters = ({ onFiltersChange, brands, categories, isLoading }: ProductFiltersProps) => {
  const [filters, setFilters] = useState<ProductFilter>({});
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [brandsOpen, setBrandsOpen] = useState(true);
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);

  useEffect(() => {
    const newFilters: ProductFilter = {
      search: searchTerm || undefined,
      minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] < 500000 ? priceRange[1] : undefined,
    };

    if (selectedBrands.length > 0) {
      newFilters.brand = selectedBrands[0]; // For now, support single brand
    }

    if (selectedCategories.length > 0) {
      newFilters.category = selectedCategories[0]; // For now, support single category
    }

    setFilters(newFilters);
    onFiltersChange(newFilters);
  }, [searchTerm, priceRange, selectedBrands, selectedCategories, onFiltersChange]);

  const handleBrandChange = (brand: string, checked: boolean) => {
    if (checked) {
      setSelectedBrands([brand]); // Single selection for now
    } else {
      setSelectedBrands(selectedBrands.filter(b => b !== brand));
    }
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([category]); // Single selection for now
    } else {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    }
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setPriceRange([0, 500000]);
    setSelectedBrands([]);
    setSelectedCategories([]);
  };

  const hasActiveFilters = searchTerm || selectedBrands.length > 0 || selectedCategories.length > 0 || priceRange[0] > 0 || priceRange[1] < 500000;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filtros</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-sm"
            >
              <X className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Buscar productos</Label>
          <Input
            id="search"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Price Range */}
        <Collapsible open={priceOpen} onOpenChange={setPriceOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-0">
            <Label className="text-sm font-medium">Precio</Label>
            <ChevronDown className={`h-4 w-4 transition-transform ${priceOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <div className="px-2">
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={500000}
                min={0}
                step={10000}
                className="w-full"
              />
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{formatPrice(priceRange[0])}</span>
              <span>{formatPrice(priceRange[1])}</span>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Brands */}
        {brands.length > 0 && (
          <Collapsible open={brandsOpen} onOpenChange={setBrandsOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-0">
              <Label className="text-sm font-medium">Marcas</Label>
              <ChevronDown className={`h-4 w-4 transition-transform ${brandsOpen ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-4">
              <div className="max-h-48 overflow-y-auto space-y-2">
                {brands.map((brand) => (
                  <div key={brand} className="flex items-center space-x-2">
                    <Checkbox
                      id={`brand-${brand}`}
                      checked={selectedBrands.includes(brand)}
                      onCheckedChange={(checked) => handleBrandChange(brand, checked as boolean)}
                    />
                    <Label
                      htmlFor={`brand-${brand}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {brand}
                    </Label>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-0">
              <Label className="text-sm font-medium">Categorías</Label>
              <ChevronDown className={`h-4 w-4 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-4">
              <div className="max-h-48 overflow-y-auto space-y-2">
                {categories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                    />
                    <Label
                      htmlFor={`category-${category}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductFilters;