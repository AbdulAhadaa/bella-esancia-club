import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-[600px] bg-gradient-to-br from-nuabok-pink via-nuabok-cream to-nuabok-mint overflow-hidden">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-nuabok-navy">
                Únete ya a nuestra lista de espera
              </h1>
            </div>
            
            <p className="text-lg text-nuabok-navy/80 max-w-md">
              Accede a nuestro scanner facial exclusivo y sé el primero en descubrir el futuro del K-beauty personalizado.
            </p>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  className="bg-nuabok-navy text-white hover:bg-nuabok-navy/90 px-8 py-3 text-lg"
                  onClick={() => window.location.href = '/agenda'}
                >
                  Agenda tu Análisis AI Beauty
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-nuabok-navy text-nuabok-navy hover:bg-nuabok-navy hover:text-white px-8 py-3 text-lg"
                  onClick={() => window.location.href = '/auth'}
                >
                  Ver mis resultados
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
              <p className="text-sm text-nuabok-navy/60">
                Análisis AI Beauty personalizado de tu piel + acceso prioritario
              </p>
            </div>
          </div>

          {/* Right content - Product showcase */}
          <div className="relative">
            <div className="relative z-10 flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
                <div className="w-64 h-64 bg-gradient-to-br from-nuabok-pink to-nuabok-mint rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">✨</div>
                    <h3 className="text-lg font-semibold text-nuabok-navy">Análisis AI</h3>
                    <p className="text-sm text-nuabok-navy/70">Scanner Facial</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
          </div>
        </div>
      </div>
      
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-nuabok-navy/10 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
};

export default Hero;