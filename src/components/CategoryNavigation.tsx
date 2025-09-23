import { useState, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { CATEGORIES } from "@/types/shopify";
import { useNavigate } from "react-router-dom";

interface CategoryNavigationProps {
  onCategorySelect?: (category: string, subcategory?: string) => void;
  onBrandSelect?: () => void;
}

const CategoryNavigation = ({ onCategorySelect, onBrandSelect }: CategoryNavigationProps) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const navigate = useNavigate();
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (categorySlug: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setActiveCategory(categorySlug);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveCategory(null);
    }, 300); // 300ms delay before closing
  };

  const handleCategoryClick = (categorySlug: string, subcategorySlug?: string) => {
    if (subcategorySlug) {
      navigate(`/catalog/${categorySlug}/${subcategorySlug}`);
    } else {
      navigate(`/catalog/${categorySlug}`);
    }
    setActiveCategory(null);
    if (onCategorySelect) {
      onCategorySelect(categorySlug, subcategorySlug);
    }
  };

  const handleBrandClick = () => {
    navigate('/catalog');
    if (onBrandSelect) {
      onBrandSelect();
    }
  };

  return (
    <nav className="border-t border-border bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-12 flex-1">
            <button
              onClick={handleBrandClick}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Marcas
            </button>
            
            <button
              onClick={() => navigate('/shopify-shop')}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Tienda Shopify
            </button>
            
            {CATEGORIES.map((category) => (
              <div
                key={category.slug}
                className="relative group"
                onMouseEnter={() => handleMouseEnter(category.slug)}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  className="text-sm font-medium hover:text-primary transition-colors flex items-center"
                  onClick={() => handleCategoryClick(category.slug)}
                >
                  {category.name}
                  <ChevronDown className="ml-1 h-3 w-3" />
                </button>
                
                {activeCategory === category.slug && category.subcategories.length > 0 && (
                  <div className="absolute top-full left-0 bg-background border border-border shadow-xl rounded-lg z-50 min-w-[400px] max-w-2xl p-6 mt-2">
                    <div className="flex flex-col gap-2">
                      {category.subcategories.map((subcategory) => (
                        <button
                          key={subcategory.slug}
                          onClick={() => handleCategoryClick(category.slug, subcategory.slug)}
                          className="text-left text-sm hover:text-primary hover:bg-muted px-4 py-3 rounded-lg transition-all duration-200 w-full flex items-center justify-start font-medium border border-transparent hover:border-primary/20 hover:shadow-md"
                        >
                          {subcategory.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex items-center space-x-4">
            <a href="/tiendas" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Tiendas
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Contáctanos
            </a>
            <span className="text-sm text-muted-foreground">Seguimiento Pedido</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default CategoryNavigation;