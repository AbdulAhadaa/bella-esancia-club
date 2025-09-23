import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { createShopifyCheckout, ShopifyProduct, CartLineItem } from '@/lib/shopify';
import { createShopifyCheckoutDirect } from '@/lib/shopify-direct';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  variantId: string;
  name: string;
  price: string;
  currencyCode: string;
  quantity: number;
  image?: string;
  vendor?: string;
}

interface ShopifyCartContextType {
  items: CartItem[];
  addToCart: (product: ShopifyProduct, variantId?: string) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  isCheckingOut: boolean;
  checkout: () => Promise<void>;
}

const ShopifyCartContext = createContext<ShopifyCartContextType | undefined>(undefined);

export const ShopifyCartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { toast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('nuabok-shopify-cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('nuabok-shopify-cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('nuabok-shopify-cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: ShopifyProduct, variantId?: string) => {
    const variant = variantId 
      ? product.variants.edges.find(edge => edge.node.id === variantId)?.node
      : product.variants.edges[0]?.node;
    
    if (!variant) {
      toast({
        title: "Error",
        description: "No hay variantes disponibles para este producto",
        variant: "destructive",
      });
      return;
    }

    if (!variant.availableForSale) {
      toast({
        title: "Producto agotado",
        description: "Este producto no está disponible",
        variant: "destructive",
      });
      return;
    }

    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.variantId === variant.id);
      
      if (existingItem) {
        toast({
          title: "Producto actualizado",
          description: `Se agregó otra unidad de ${product.title}`,
        });
        return prevItems.map(item =>
          item.variantId === variant.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        toast({
          title: "Producto agregado",
          description: `${product.title} se agregó al carrito`,
        });
        return [...prevItems, {
          id: product.id,
          variantId: variant.id,
          name: product.title,
          price: variant.price.amount,
          currencyCode: variant.price.currencyCode,
          quantity: 1,
          image: product.featuredImage?.url,
          vendor: product.vendor
        }];
      }
    });
  };

  const removeFromCart = (variantId: string) => {
    setItems(prevItems => {
      const item = prevItems.find(item => item.variantId === variantId);
      if (item) {
        toast({
          title: "Producto eliminado",
          description: `${item.name} se eliminó del carrito`,
        });
      }
      return prevItems.filter(item => item.variantId !== variantId);
    });
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }
    
    setItems(prevItems =>
      prevItems.map(item =>
        item.variantId === variantId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    toast({
      title: "Carrito vaciado",
      description: "Se eliminaron todos los productos del carrito",
    });
  };

  const checkout = async () => {
    if (items.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "Agrega productos al carrito antes de proceder",
        variant: "destructive",
      });
      return;
    }

    setIsCheckingOut(true);
    
    try {
      const lineItems: CartLineItem[] = items.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity
      }));

      console.log('Creating checkout with items:', lineItems);
      // Try direct Shopify API first, fallback to edge function
      let checkoutUrl;
      try {
        checkoutUrl = await createShopifyCheckoutDirect(lineItems);
        console.log('Direct Shopify checkout successful');
      } catch (directError) {
        console.log('Direct API failed, trying edge function:', directError);
        checkoutUrl = await createShopifyCheckout(lineItems);
      }
      
      if (!checkoutUrl) {
        throw new Error('No se recibió URL de checkout de Shopify');
      }
      
      // Open checkout in new tab and clear cart
      window.open(checkoutUrl, '_blank');
      clearCart();
      
      toast({
        title: "Redirigiendo a checkout",
        description: "Se abrió una nueva ventana para completar tu compra",
      });
    } catch (error) {
      console.error('Checkout error:', error);
      const errorMessage = error.message || error.toString();
      
      let description = "No se pudo procesar el checkout. Intenta de nuevo.";
      
      if (errorMessage.includes('No hay productos disponibles')) {
        description = "Los productos en tu carrito no están disponibles en la tienda Shopify.";
      } else if (errorMessage.includes('Shopify API error')) {
        description = "Error de conexión con Shopify. Verifica la configuración.";
      } else if (errorMessage.includes('Failed to create checkout')) {
        description = "No se pudo crear el checkout. Los productos pueden no estar disponibles.";
      }
      
      toast({
        title: "Error",
        description,
        variant: "destructive",
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <ShopifyCartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      itemCount,
      isCheckingOut,
      checkout
    }}>
      {children}
    </ShopifyCartContext.Provider>
  );
};

export const useShopifyCart = () => {
  const context = useContext(ShopifyCartContext);
  if (context === undefined) {
    // Return safe default values instead of throwing error
    console.warn('useShopifyCart called outside of ShopifyCartProvider - returning default values');
    return {
      items: [],
      addToCart: () => console.warn('Cart not available - addToCart disabled'),
      removeFromCart: () => console.warn('Cart not available - removeFromCart disabled'),
      updateQuantity: () => console.warn('Cart not available - updateQuantity disabled'),
      clearCart: () => console.warn('Cart not available - clearCart disabled'),
      itemCount: 0,
      isCheckingOut: false,
      checkout: async () => console.warn('Cart not available - checkout disabled')
    };
  }
  return context;
};