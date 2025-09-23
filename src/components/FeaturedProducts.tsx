import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart } from "lucide-react";

const FeaturedProducts = () => {
  const products = [
    {
      id: 1,
      name: "Limpiador Facial Suave",
      brand: "Nuabok",
      price: 25900,
      originalPrice: 32900,
      image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop",
      isNew: true,
      discount: 21
    },
    {
      id: 2,
      name: "Sérum Hidratante con Ácido Hialurónico",
      brand: "Nuabok",
      price: 42900,
      image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300&h=300&fit=crop",
      isHot: true
    },
    {
      id: 3,
      name: "Crema Anti-edad con Colágeno",
      brand: "Nuabok",
      price: 67900,
      image: "https://images.unsplash.com/photo-1570194065650-d99b4b57b8b5?w=300&h=300&fit=crop",
      isExclusive: true
    },
    {
      id: 4,
      name: "Mascarilla Nutritiva Nocturna",
      brand: "Nuabok",
      price: 38900,
      originalPrice: 45900,
      image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&h=300&fit=crop",
      discount: 15
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Próximamente en Nuabok
          </h2>
          <p className="text-muted-foreground text-lg">
            Los mejores productos de skincare coreano llegarán pronto
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="relative">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {product.isNew && (
                    <Badge className="bg-green-500 text-white">NUEVO</Badge>
                  )}
                  {product.isHot && (
                    <Badge className="bg-red-500 text-white">HOT</Badge>
                  )}
                  {product.isExclusive && (
                    <Badge className="bg-nuabok-navy text-white">EXCLUSIVO</Badge>
                  )}
                  {product.discount && (
                    <Badge className="bg-orange-500 text-white">-{product.discount}%</Badge>
                  )}
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">{product.brand}</p>
                  <h3 className="text-sm font-medium text-foreground line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-foreground">
                      ${product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        ${product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <Button 
                    className="w-full bg-muted text-muted-foreground hover:bg-muted cursor-not-allowed"
                    size="sm"
                    disabled
                  >
                    Próximamente
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg"
            className="border-nuabok-navy text-nuabok-navy hover:bg-nuabok-yellow"
            disabled
          >
            Catálogo Completo - Próximamente
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;