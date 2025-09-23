import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StorefrontCart, createCart, getCart, addToCart, updateCartLines, removeFromCart } from '@/lib/shopify-storefront';
import { useToast } from '@/hooks/use-toast';

interface CartContextType {
  cart: StorefrontCart | null;
  isLoading: boolean;
  itemCount: number;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  checkout: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'nuabok_cart_v1';

interface StorefrontCartProviderProps {
  children: ReactNode;
}

export function StorefrontCartProvider({ children }: StorefrontCartProviderProps) {
  const [cart, setCart] = useState<StorefrontCart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Calculate item count
  const itemCount = cart?.lines?.edges?.reduce((total, line) => total + line.node.quantity, 0) || 0;

  // Load cart from localStorage on mount
  useEffect(() => {
    loadCartFromStorage();
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({
        cartId: cart.id,
        checkoutUrl: cart.checkoutUrl
      }));
    }
  }, [cart]);

  const loadCartFromStorage = async () => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const { cartId } = JSON.parse(stored);
        if (cartId) {
          setIsLoading(true);
          const existingCart = await getCart(cartId);
          if (existingCart) {
            setCart(existingCart);
          } else {
            // Cart no longer exists, clear storage
            localStorage.removeItem(CART_STORAGE_KEY);
          }
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      localStorage.removeItem(CART_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCart = async () => {
    if (!cart?.id) return;
    
    try {
      const updatedCart = await getCart(cart.id);
      if (updatedCart) {
        setCart(updatedCart);
      }
    } catch (error) {
      console.error('Error refreshing cart:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el carrito",
        variant: "destructive",
      });
    }
  };

  const addItem = async (variantId: string, quantity: number = 1) => {
    try {
      setIsLoading(true);
      
      let currentCart = cart;
      
      // Create cart if it doesn't exist
      if (!currentCart) {
        currentCart = await createCart([{ merchandiseId: variantId, quantity }]);
        setCart(currentCart);
        toast({
          title: "Producto agregado",
          description: "El producto se agregó al carrito",
        });
        return;
      }

      // Add to existing cart
      const updatedCart = await addToCart(currentCart.id, [{ merchandiseId: variantId, quantity }]);
      setCart(updatedCart);
      
      toast({
        title: "Producto agregado",
        description: "El producto se agregó al carrito",
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el producto al carrito",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateItem = async (lineId: string, quantity: number) => {
    if (!cart) return;

    try {
      setIsLoading(true);
      
      if (quantity <= 0) {
        await removeItem(lineId);
        return;
      }

      const updatedCart = await updateCartLines(cart.id, [{ id: lineId, quantity }]);
      setCart(updatedCart);
      
      toast({
        title: "Carrito actualizado",
        description: "La cantidad se actualizó correctamente",
      });
    } catch (error) {
      console.error('Error updating cart:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la cantidad",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (lineId: string) => {
    if (!cart) return;

    try {
      setIsLoading(true);
      const updatedCart = await removeFromCart(cart.id, [lineId]);
      setCart(updatedCart);
      
      toast({
        title: "Producto eliminado",
        description: "El producto se eliminó del carrito",
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    setCart(null);
    localStorage.removeItem(CART_STORAGE_KEY);
    
    toast({
      title: "Carrito vaciado",
      description: "Se eliminaron todos los productos del carrito",
    });
  };

  const checkout = () => {
    if (cart?.checkoutUrl) {
      window.open(cart.checkoutUrl, '_blank');
    } else {
      toast({
        title: "Error",
        description: "No se pudo procesar el checkout",
        variant: "destructive",
      });
    }
  };

  const value: CartContextType = {
    cart,
    isLoading,
    itemCount,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    checkout,
    refreshCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useStorefrontCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useStorefrontCart must be used within a StorefrontCartProvider');
  }
  return context;
}