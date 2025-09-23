import { Card, CardContent } from "@/components/ui/card";

const SkincareGallery = () => {
  const galleryImages = [
    {
      src: "/lovable-uploads/d0768b08-7d38-40be-86c9-28ffa769a638.png",
      alt: "Rutina de skincare coreano - Mascarillas faciales",
      title: "Mascarillas Personalizadas"
    },
    {
      src: "/lovable-uploads/15575d67-0e16-48ba-b8a2-3dde688a046f.png",
      alt: "Aplicación de productos skincare coreanos",
      title: "Aplicación Profesional"
    },
    {
      src: "/lovable-uploads/7292ef8e-2e57-4e8f-8cf2-d3feef410b74.png",
      alt: "Rutina completa de skincare coreano",
      title: "Rutina Completa"
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-nuabok-navy mb-4">
            Descubre tu Rutina Perfecta
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Con nuestro scanner facial, te ayudamos a encontrar los productos ideales para tu tipo de piel
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {galleryImages.map((image, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0">
                <div className="relative aspect-square">
                  <img 
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-nuabok-navy/70 to-transparent flex items-end">
                    <div className="p-6 text-white">
                      <h3 className="text-xl font-semibold">{image.title}</h3>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkincareGallery;