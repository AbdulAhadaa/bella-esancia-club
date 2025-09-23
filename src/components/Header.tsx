import { Search, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProductsMenu from "./ProductsMenu";
import CartDrawer from "./CartDrawer";
import { ShopifyCartDrawer } from "./ShopifyCartDrawer";
import { StorefrontCartDrawer } from "./StorefrontCartDrawer";
import CategoryNavigation from "./CategoryNavigation";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";

const Header = () => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const location = useLocation();

  const handleAddToCart = (product: any) => {
    addToCart(product);
    toast({
      title: "Producto agregado",
      description: `${product.name} se agregó al carrito`,
    });
  };

  return (
    <header className="bg-background border-b border-border">
      {/* Top banner */}
      <div className="bg-nuabok-navy text-primary-foreground py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center text-sm space-x-6">
            <span>🚚 Envío gratis por compras sobre $150.000</span>
            <span>📦 Compra online, retira en tienda</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" aria-label="Ir al inicio" className="inline-flex items-center hover:opacity-80 transition-opacity">
              <img 
                src="/lovable-uploads/nuabok-logo.png" 
                alt="Nuabok - Skincare Coreano" 
                className="h-16 w-auto cursor-pointer"
              />
            </a>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Buscar productos..." 
                className="pl-10 pr-4 py-2 w-full"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => window.location.href = '/account'}>
              <User className="h-5 w-5 mr-2" />
              Mi cuenta
            </Button>
            <Button variant="ghost" size="sm">
              <Heart className="h-5 w-5 mr-2" />
              Lista de deseos
              <span className="ml-1 bg-secondary text-secondary-foreground text-xs px-1.5 py-0.5 rounded-full">0</span>
            </Button>
            {location.pathname.startsWith('/shopify-shop') ? (
              <ShopifyCartDrawer />
            ) : (
              <CartDrawer />
            )}
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <CategoryNavigation />
    </header>
  );
};

export default Header;