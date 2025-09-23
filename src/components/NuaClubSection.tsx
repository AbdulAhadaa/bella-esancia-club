import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, TrendingUp, Gift, Users } from "lucide-react";

const NuaClubSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-nuabok-navy to-nuabok-navy/90">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Únete a <span className="text-nuabok-pink">NuaClub</span>
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Descubre el poder de la tecnología coreana para tu piel. Realiza análisis personalizados y sigue tu progreso.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-nuabok-yellow rounded-full w-fit">
                <Sparkles className="h-6 w-6 text-nuabok-navy" />
              </div>
              <CardTitle className="text-lg">Análisis de Piel</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-white/80 text-center">
                Escanea tu piel con IA avanzada para obtener recomendaciones personalizadas
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-nuabok-cream rounded-full w-fit">
                <TrendingUp className="h-6 w-6 text-nuabok-navy" />
              </div>
              <CardTitle className="text-lg">Seguimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-white/80 text-center">
                Monitorea tu progreso y ve los cambios en tu piel semana a semana
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-nuabok-mint rounded-full w-fit">
                <Gift className="h-6 w-6 text-nuabok-navy" />
              </div>
              <CardTitle className="text-lg">Beneficios Exclusivos</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-white/80 text-center">
                Descuentos especiales, productos en preventa y contenido exclusivo
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-nuabok-pink rounded-full w-fit">
                <Users className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg">Rutinas Personalizadas</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-white/80 text-center">
                Recibe rutinas adaptadas a tu tipo de piel y objetivos específicos
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            className="bg-nuabok-yellow text-nuabok-navy hover:bg-nuabok-cream px-8 py-3 text-lg font-semibold"
          >
            Comienza tu Análisis Gratis
          </Button>
          <p className="text-white/60 mt-4 text-sm">
            * Primer análisis gratuito para nuevos miembros
          </p>
        </div>
      </div>
    </section>
  );
};

export default NuaClubSection;