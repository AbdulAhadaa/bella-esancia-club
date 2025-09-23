import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Clock, Phone, Mail } from "lucide-react";

const Tiendas = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-[500px] bg-gradient-to-br from-nuabok-yellow via-nuabok-cream to-nuabok-mint overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-6xl font-bold text-nuabok-navy">
                Nuestras Tiendas
              </h1>
              <h2 className="text-3xl font-light text-nuabok-navy">
                Próximamente
              </h2>
            </div>
            
            <p className="text-xl text-nuabok-navy/80 max-w-2xl mx-auto">
              Estamos trabajando para traerte la mejor experiencia en skincare coreano directamente a tu ciudad.
            </p>
            
            <div className="space-y-6">
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-nuabok-navy mb-4">
                  ¿Te gustaría una tienda en tu ciudad?
                </h3>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Ingresa tu ciudad"
                    className="flex-1"
                  />
                  <Button className="bg-nuabok-navy text-white hover:bg-nuabok-navy/90">
                    Enviar
                  </Button>
                </div>
                <p className="text-sm text-nuabok-navy/60 mt-2">
                  Te notificaremos cuando abramos en tu zona
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-nuabok-navy/10 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Coming Soon Features */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Lo que puedes esperar
            </h2>
            <p className="text-muted-foreground text-lg">
              Nuestras tiendas físicas ofrecerán una experiencia única
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-nuabok-yellow rounded-full flex items-center justify-center">
                <MapPin className="h-8 w-8 text-nuabok-navy" />
              </div>
              <h3 className="text-lg font-semibold">Ubicaciones Prime</h3>
              <p className="text-muted-foreground text-sm">
                En los mejores centros comerciales y zonas comerciales
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-nuabok-cream rounded-full flex items-center justify-center">
                <Clock className="h-8 w-8 text-nuabok-navy" />
              </div>
              <h3 className="text-lg font-semibold">Horarios Extendidos</h3>
              <p className="text-muted-foreground text-sm">
                Abierto de lunes a domingo para tu comodidad
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-nuabok-mint rounded-full flex items-center justify-center">
                <Phone className="h-8 w-8 text-nuabok-navy" />
              </div>
              <h3 className="text-lg font-semibold">Asesoría Personalizada</h3>
              <p className="text-muted-foreground text-sm">
                Expertos en K-beauty para guiarte en tu rutina
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-nuabok-navy" />
              </div>
              <h3 className="text-lg font-semibold">Eventos Exclusivos</h3>
              <p className="text-muted-foreground text-sm">
                Talleres, lanzamientos y actividades especiales
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-nuabok-navy">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold text-white">
              Mantente al día
            </h2>
            <p className="text-white/80 max-w-xl mx-auto">
              Suscríbete para ser el primero en conocer cuándo abrimos nuestras tiendas físicas y recibir ofertas exclusivas.
            </p>
            <div className="max-w-md mx-auto flex gap-2">
              <Input 
                placeholder="Tu email"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
              <Button className="bg-nuabok-yellow text-nuabok-navy hover:bg-nuabok-cream">
                Suscribirse
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Tiendas;