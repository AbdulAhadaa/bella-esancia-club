import { Facebook, Instagram, Youtube, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  return (
    <footer className="bg-nuabok-navy text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand section */}
          <div className="space-y-4">
            <img 
              src="/lovable-uploads/7e3dcf48-59cf-425e-8eca-7bf99cc155f6.png" 
              alt="Nuabok" 
              className="h-12 w-auto brightness-0 invert"
            />
            <p className="text-white/80">
              Tu destino para el mejor skincare coreano. Descubre productos auténticos y tecnología avanzada para el cuidado de tu piel.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="text-white hover:text-nuabok-yellow">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:text-nuabok-yellow">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:text-nuabok-yellow">
                <Youtube className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Skincare</h3>
            <ul className="space-y-2 text-white/80">
              <li><a href="#" className="hover:text-white transition-colors">Limpieza</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Hidratación</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Anti-edad</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Tratamientos</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sets & Kits</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Próximamente</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Atención al Cliente</h3>
            <ul className="space-y-2 text-white/80">
              <li><a href="#" className="hover:text-white transition-colors">Mi Cuenta</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Seguimiento de Pedido</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cambios y Devoluciones</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Preguntas Frecuentes</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
              <li><a href="/terminos" className="hover:text-white transition-colors">Términos y Condiciones</a></li>
            </ul>
          </div>

          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:hola@nuabok.com" className="hover:text-white transition-colors">hola@nuabok.com</a>
              </li>
              <li>Skincare Hana SAS</li>
              <li>Bogotá, Colombia</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/60 text-sm">
              © 2025 Nuabok - Skincare Hana SAS. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/terminos" className="text-white/60 hover:text-white text-sm transition-colors">
                Términos y Condiciones
              </a>
              <a href="#" className="text-white/60 hover:text-white text-sm transition-colors">
                Política de Privacidad
              </a>
              <a href="#" className="text-white/60 hover:text-white text-sm transition-colors">
                Políticas de Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;