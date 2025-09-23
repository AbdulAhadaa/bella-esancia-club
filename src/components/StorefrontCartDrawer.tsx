import { ShoppingCart, Plus, Minus, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useStorefrontCart } from "@/hooks/useStorefrontCart";
import { formatPrice } from "@/lib/shopify-storefront";

export function StorefrontCartDrawer() {
  const { cart, itemCount, updateItem, removeItem, clearCart, checkout, isLoading } = useStorefrontCart();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <ShoppingCart className="w-4 h-4" />
          {itemCount > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 min-w-[1.2rem] h-5 text-xs">
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Carrito de compras</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {!cart || cart.lines.edges.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Tu carrito está vacío</h3>
              <p className="text-muted-foreground">Agrega algunos productos para empezar</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-auto py-4">
                <div className="space-y-4">
                  {cart.lines.edges.map(({ node: line }) => (
                    <div key={line.id} className="flex gap-3 p-3 border rounded-lg">
                      {line.merchandise.product.featuredImage && (
                        <img
                          src={line.merchandise.product.featuredImage.url}
                          alt={line.merchandise.product.featuredImage.altText || line.merchandise.product.title}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2">
                          {line.merchandise.product.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {line.merchandise.product.vendor}
                        </p>
                        {line.merchandise.title !== "Default Title" && (
                          <p className="text-xs text-muted-foreground">
                            {line.merchandise.title}
                          </p>
                        )}
                        <p className="font-medium text-sm">
                          {formatPrice(line.merchandise.price.amount, line.merchandise.price.currencyCode)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(line.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="w-6 h-6"
                            onClick={() => updateItem(line.id, line.quantity - 1)}
                            disabled={isLoading}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{line.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="w-6 h-6"
                            onClick={() => updateItem(line.id, line.quantity + 1)}
                            disabled={isLoading}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Subtotal:</span>
                  <span className="text-lg font-bold">
                    {formatPrice(cart.cost.subtotalAmount.amount, cart.cost.subtotalAmount.currencyCode)}
                  </span>
                </div>

                <div className="space-y-2">
                  <Button 
                    onClick={checkout} 
                    className="w-full" 
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? "Procesando..." : "Finalizar Compra"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={clearCart} 
                    className="w-full"
                    disabled={isLoading}
                  >
                    Vaciar Carrito
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}