import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Terminos = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-nuabok-navy mb-8">Términos y Condiciones</h1>
          
          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-nuabok-navy mb-4">1. Información de la Empresa</h2>
              <p className="text-gray-700 mb-4">
                Estos términos y condiciones regulan el uso del sitio web y los servicios ofrecidos por <strong>Skincare Hana SAS</strong>, 
                sociedad comercial constituida bajo las leyes de la República de Colombia, con domicilio principal en Bogotá, Colombia.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-nuabok-navy mb-4">2. Aceptación de los Términos</h2>
              <p className="text-gray-700 mb-4">
                Al acceder y utilizar este sitio web, usted acepta estar sujeto a estos términos y condiciones de uso. 
                Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestros servicios.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-nuabok-navy mb-4">3. Servicios Ofrecidos</h2>
              <p className="text-gray-700 mb-4">
                Nuabok ofrece productos de skincare coreano y servicios de análisis facial mediante tecnología avanzada. 
                Nuestros servicios incluyen:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Venta de productos de cuidado facial</li>
                <li>Análisis facial personalizado mediante scanner digital</li>
                <li>Consultas y recomendaciones de skincare</li>
                <li>Servicios de citas presenciales</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-nuabok-navy mb-4">4. Registro y Cuenta de Usuario</h2>
              <p className="text-gray-700 mb-4">
                Para acceder a ciertos servicios, debe crear una cuenta proporcionando información veraz y actualizada. 
                Es responsable de mantener la confidencialidad de sus credenciales de acceso.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-nuabok-navy mb-4">5. Política de Privacidad</h2>
              <p className="text-gray-700 mb-4">
                El tratamiento de sus datos personales se rige por nuestra Política de Privacidad, 
                en cumplimiento de la Ley 1581 de 2012 de Protección de Datos Personales de Colombia 
                y demás normatividad aplicable.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-nuabok-navy mb-4">6. Condiciones de Compra</h2>
              <p className="text-gray-700 mb-4">
                Todas las compras están sujetas a disponibilidad de inventario. Los precios están expresados en pesos colombianos (COP) 
                e incluyen el IVA cuando aplique, conforme a la legislación tributaria colombiana.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-nuabok-navy mb-4">7. Derecho de Retracto</h2>
              <p className="text-gray-700 mb-4">
                Conforme al Estatuto del Consumidor (Ley 1480 de 2011), usted tiene derecho a retractarse de su compra 
                dentro de los cinco (5) días hábiles siguientes a la entrega del producto, siempre que el producto 
                se encuentre en las mismas condiciones en que fue entregado.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-nuabok-navy mb-4">8. Limitación de Responsabilidad</h2>
              <p className="text-gray-700 mb-4">
                Los análisis y recomendaciones proporcionados por nuestro scanner facial son de carácter informativo 
                y no constituyen diagnóstico médico. Recomendamos consultar con un dermatólogo para tratamientos específicos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-nuabok-navy mb-4">9. Ley Aplicable</h2>
              <p className="text-gray-700 mb-4">
                Estos términos se rigen por las leyes de la República de Colombia. 
                Cualquier controversia será resuelta por los tribunales competentes de Bogotá, Colombia.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-nuabok-navy mb-4">10. Contacto</h2>
              <p className="text-gray-700 mb-4">
                Para cualquier consulta sobre estos términos y condiciones, puede contactarnos a través de:
              </p>
              <ul className="list-none text-gray-700 space-y-2">
                <li><strong>Email:</strong> info@nuabok.com</li>
                <li><strong>Teléfono:</strong> +57 1 234 5678</li>
                <li><strong>Dirección:</strong> Bogotá, Colombia</li>
              </ul>
            </section>

            <p className="text-sm text-gray-500 mt-8">
              Última actualización: Enero 2025
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terminos;