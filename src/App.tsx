import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/hooks/useCart";
import { ShopifyCartProvider } from "@/hooks/useShopifyCart";
import { StorefrontCartProvider } from "@/hooks/useStorefrontCart";
import { startAutoSync } from "@/lib/shopify-sync";
import Index from "./pages/Index";
import Tiendas from "./pages/Tiendas";
import Terminos from "./pages/Terminos";
import Auth from "./pages/Auth";
import EmailVerified from "./pages/EmailVerified";
import Products from "./pages/Products";
import Agenda from "./pages/Agenda";
import Shop from "./pages/Shop";
import Brands from "./pages/Brands";
import Account from "./pages/Account";
import NotFound from "./pages/NotFound";
import TestShopify from "./pages/TestShopify";
import ShopifyShop from "./pages/ShopifyShop";
import StorefrontCatalog from "./pages/StorefrontCatalog";
import StorefrontProduct from "./pages/StorefrontProduct";

const queryClient = new QueryClient();

// Start auto-sync when app loads
startAutoSync();

const App = () => (
  <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <ShopifyCartProvider>
            <StorefrontCartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/tiendas" element={<Tiendas />} />
            <Route path="/productos" element={<Products />} />
            <Route path="/shop" element={<StorefrontCatalog />} />
            <Route path="/shop/:category" element={<StorefrontCatalog />} />
            <Route path="/shop/:category/:subcategory" element={<StorefrontCatalog />} />
            <Route path="/brands" element={<Brands />} />
            <Route path="/terminos" element={<Terminos />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/email-verified" element={<EmailVerified />} />
            <Route path="/account" element={<Account />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/test-shopify" element={<TestShopify />} />
            <Route path="/shopify-shop" element={<ShopifyShop />} />
            <Route path="/shopify-shop/:category" element={<ShopifyShop />} />
            <Route path="/shopify-shop/:category/:subcategory" element={<ShopifyShop />} />
            <Route path="/catalog" element={<StorefrontCatalog />} />
            <Route path="/catalog/:category" element={<StorefrontCatalog />} />
            <Route path="/catalog/:category/:subcategory" element={<StorefrontCatalog />} />
            <Route path="/product/:handle" element={<StorefrontProduct />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
            </BrowserRouter>
            </StorefrontCartProvider>
          </ShopifyCartProvider>
        </CartProvider>
      </TooltipProvider>
  </QueryClientProvider>
);

export default App;
