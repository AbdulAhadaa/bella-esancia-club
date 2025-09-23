import { Button } from "@/components/ui/button";

const SimpleProductSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Nuestros Productos
          </h2>
          <p className="text-muted-foreground text-lg">
            Descubre nuestra línea completa de productos de skincare
          </p>
        </div>

        <div className="text-center">
          <Button 
            variant="outline" 
            size="lg"
            className="border-nuabok-navy text-nuabok-navy hover:bg-nuabok-yellow"
            onClick={() => window.location.href = '/catalog'}
          >
            Ver Catálogo Completo
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SimpleProductSection;