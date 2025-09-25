import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { CATEGORIES } from "@/types/shopify";
import { useNavigate } from "react-router-dom";
import { getDynamicCategories, DynamicCategory } from "@/lib/dynamic-categories";

interface CategoryNavigationProps {
  onCategorySelect?: (category: string, subcategory?: string) => void;
  onBrandSelect?: () => void;
}

const CategoryNavigation = ({ onCategorySelect, onBrandSelect }: CategoryNavigationProps) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [dynamicCategories, setDynamicCategories] = useState<DynamicCategory[]>([]);
  const navigate = useNavigate();
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    getDynamicCategories().then(setDynamicCategories);
  }, []);

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
                
                {activeCategory === category.slug && (
                  <div className="absolute top-full left-0 bg-background border border-border shadow-lg rounded-md z-50 min-w-[200px] py-2 mt-1">
                    {category.slug === 'skincare' && dynamicCategories.length > 0 ? (
                      dynamicCategories.map((dynCategory) => (
                        <button
                          key={dynCategory.slug}
                          onClick={() => handleCategoryClick(category.slug, dynCategory.slug)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors"
                        >
                          {dynCategory.name}
                        </button>
                      ))
                    ) : (
                      category.subcategories.map((subcategory) => (
                        <button
                          key={subcategory.slug}
                          onClick={() => handleCategoryClick(category.slug, subcategory.slug)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors"
                        >
                          {subcategory.name}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex items-center space-x-4">
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